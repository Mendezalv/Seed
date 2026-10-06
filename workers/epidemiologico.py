from celery import shared_task
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from workers.db import SessionLocal
from src.epidemiologico.domain.models import OcorrenciaSanitaria, AlertaEpidemiologico, DadosClimaticoCache
from src.epidemiologico.domain.motor_alertas import REGRAS_RISCO

@shared_task(name='workers.epidemiologico.processar_alertas')
def processar_alertas():
    """
    Varre ocorrências sanitárias das últimas 48h e calcula o risco de proliferação epidemiológica.
    Gera alertas preventivos e de surto quando o score ultrapassar o limiar de segurança.
    """
    session = SessionLocal()
    alertas_gerados = 0
    try:
        limite_tempo = datetime.now(timezone.utc) - timedelta(hours=48)
        stmt_ocorrencias = select(OcorrenciaSanitaria).where(
            OcorrenciaSanitaria.observado_em >= limite_tempo
        )
        ocorrencias = session.execute(stmt_ocorrencias).scalars().all()

        for oco in ocorrencias:
            regra = REGRAS_RISCO.get(oco.agente_identificado)
            if not regra:
                continue

            # 1. Avalia dados meteorológicos locais dos últimos 7 dias
            stmt_clima = select(DadosClimaticoCache).where(
                DadosClimaticoCache.latitude.between(oco.latitude - 0.5, oco.latitude + 0.5),
                DadosClimaticoCache.longitude.between(oco.longitude - 0.5, oco.longitude + 0.5)
            ).order_by(DadosClimaticoCache.data_referencia.desc()).limit(7)
            climas = session.execute(stmt_clima).scalars().all()

            # Cálculo de score climático
            if climas:
                score_total = 0.0
                for c in climas:
                    t = c.temp_media_c or 25.0
                    u = c.umidade_relativa_pct or 70.0
                    t_min, t_max = regra['temp_ideal']
                    s_t = 1.0 if t_min <= t <= t_max else max(0.0, 1.0 - abs((t_min + t_max) / 2 - t) / 10.0)
                    s_u = 1.0 if u >= regra['umidade_ideal'] else max(0.0, u / regra['umidade_ideal'])
                    score_total += (s_t + s_u) / 2
                score_clima = score_total / len(climas)
            else:
                score_clima = 0.5

            # 2. Avalia ocorrências no raio de 35 km
            delta_deg = 35.0 / 111.0
            data_limite_hist = datetime.now(timezone.utc) - timedelta(days=30)
            stmt_vizinhas = select(OcorrenciaSanitaria).where(
                OcorrenciaSanitaria.agente_identificado == oco.agente_identificado,
                OcorrenciaSanitaria.latitude.between(oco.latitude - delta_deg, oco.latitude + delta_deg),
                OcorrenciaSanitaria.longitude.between(oco.longitude - delta_deg, oco.longitude + delta_deg),
                OcorrenciaSanitaria.observado_em >= data_limite_hist
            )
            vizinhas = session.execute(stmt_vizinhas).scalars().all()
            pesos_sev = {'BAIXA': 1, 'MEDIA': 2, 'ALTA': 3, 'CRITICA': 4}
            score_hist = min(sum(pesos_sev.get(v.severidade, 1) for v in vizinhas) / 40.0, 1.0)

            # 3. Score ponderado final
            risco = (score_clima * regra['peso_clima']) + (score_hist * regra['peso_hist'])
            risco_final = min(max(risco, 0.0), 1.0)

            # Se risco for elevado (> 0.65), verifica se já existe alerta ativo na região
            if risco_final >= 0.65:
                stmt_alerta_existente = select(AlertaEpidemiologico).where(
                    AlertaEpidemiologico.propriedade_id == oco.propriedade_id,
                    AlertaEpidemiologico.agente == oco.agente_identificado,
                    AlertaEpidemiologico.latitude_centro.between(oco.latitude - 0.2, oco.latitude + 0.2),
                    AlertaEpidemiologico.longitude_centro.between(oco.longitude - 0.2, oco.longitude + 0.2),
                    AlertaEpidemiologico.notificado == False
                )
                if not session.execute(stmt_alerta_existente).scalar_one_or_none():
                    novo_alerta = AlertaEpidemiologico(
                        propriedade_id=oco.propriedade_id,
                        tipo_alerta="SURTO" if risco_final >= 0.85 else "RISCO_ELEVADO",
                        agente=oco.agente_identificado,
                        risco_score=round(risco_final, 3),
                        fatores_contribuintes={
                            "score_climatico": round(score_clima, 2),
                            "score_vizinhas": round(score_hist, 2),
                            "total_focos_regiao": len(vizinhas)
                        },
                        latitude_centro=oco.latitude,
                        longitude_centro=oco.longitude,
                        raio_km=35.0,
                        notificado=False,
                        valido_ate=datetime.now(timezone.utc) + timedelta(days=7)
                    )
                    session.add(novo_alerta)
                    alertas_gerados += 1

        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Erro ao processar alertas epidemiológicos: {e}")
    finally:
        session.close()

    return {"status": "success", "alertas_gerados": alertas_gerados}
