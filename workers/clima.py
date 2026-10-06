from celery import shared_task
from datetime import date, datetime, timedelta
import asyncio
from sqlalchemy import select
from workers.db import SessionLocal
from src.epidemiologico.domain.models import DadosClimaticoCache
from src.shared.database.models import Propriedade

@shared_task(name='workers.clima.fetch_dados_inmet')
def fetch_dados_inmet():
    """
    Busca e sincroniza dados meteorológicos diários do INMET.
    Salva no cache local para uso pelo motor de alertas epidemiológicos.
    """
    session = SessionLocal()
    salvos = 0
    try:
        from src.shared.integrations.clima.inmet import INMETClient
        inmet = INMETClient()
        
        hoje = date.today()
        ontem = hoje - timedelta(days=1)
        
        # Estações de referência agrícola (ex: Brasília, Uberlândia, Londrina, Sorriso)
        estacoes = ["A001", "A507", "A801"]
        
        for codigo in estacoes:
            try:
                # Executa chamada assíncrona do client HTTP no worker síncrono
                dados = asyncio.run(inmet.obter_dados_diarios(codigo, ontem, hoje))
                for d in dados:
                    stmt = select(DadosClimaticoCache).where(
                        DadosClimaticoCache.latitude == -15.78,
                        DadosClimaticoCache.longitude == -47.93,
                        DadosClimaticoCache.data_referencia == d.data,
                        DadosClimaticoCache.fonte == "INMET"
                    )
                    existente = session.execute(stmt).scalar_one_or_none()
                    if not existente:
                        novo = DadosClimaticoCache(
                            latitude=-15.78,
                            longitude=-47.93,
                            data_referencia=d.data,
                            temp_media_c=d.temperatura_max,
                            temp_max_c=d.temperatura_max,
                            temp_min_c=d.temperatura_min,
                            umidade_relativa_pct=d.umidade,
                            precipitacao_mm=d.precipitacao,
                            fonte="INMET"
                        )
                        session.add(novo)
                        salvos += 1
            except Exception as e:
                print(f"Erro ao consultar estação {codigo}: {e}")
                continue
                
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Erro geral no worker de clima INMET: {e}")
    finally:
        session.close()

    return {"status": "success", "novos_registros_cache": salvos}

@shared_task(name='workers.clima.fetch_dados_cptec')
def fetch_dados_cptec():
    """
    Fallback meteorológico via CPTEC/INPE quando INMET estiver inacessível.
    """
    session = SessionLocal()
    salvos = 0
    try:
        from src.shared.integrations.clima.cptec import CPTECClient
        cptec = CPTECClient()
        
        # Previsão para centro produtor (ex: ID 244 - São Paulo ou similar)
        previsoes = asyncio.run(cptec.previsao_7dias(244))
        for p in getattr(previsoes, 'previsoes', []):
            stmt = select(DadosClimaticoCache).where(
                DadosClimaticoCache.latitude == -23.55,
                DadosClimaticoCache.longitude == -46.63,
                DadosClimaticoCache.data_referencia == p.dia,
                DadosClimaticoCache.fonte == "CPTEC"
            )
            existente = session.execute(stmt).scalar_one_or_none()
            if not existente:
                novo = DadosClimaticoCache(
                    latitude=-23.55,
                    longitude=-46.63,
                    data_referencia=p.dia,
                    temp_max_c=float(p.maxima),
                    temp_min_c=float(p.minima),
                    fonte="CPTEC"
                )
                session.add(novo)
                salvos += 1
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Erro no fallback CPTEC: {e}")
    finally:
        session.close()

    return {"status": "success", "novos_registros_fallback": salvos}
