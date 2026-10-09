from uuid import UUID
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.shared.database.models import Propriedade
from src.operacional.domain.models import (
    Talhao, Safra, AlocacaoInsumo, LoteInsumo, Insumo,
    Maquinario, OrdemManutencao
)
from src.epidemiologico.domain.models import (
    OcorrenciaSanitaria, AlertaEpidemiologico, DadosClimaticoCache
)
from src.energetico.domain.models import RelatorioESG
from src.shared.dashboard.schemas import (
    DashboardConsolidadoResponse,
    ResumoPropriedadeGeral,
    ResumoOperacionalFinanceiro,
    ResumoEpidemiologico,
    AgenteResumo,
    ResumoSustentabilidadeESG,
    ResumoClimaRecente
)

class DashboardService:
    @staticmethod
    async def obter_consolidado(
        propriedade_id: UUID,
        session: AsyncSession
    ) -> DashboardConsolidadoResponse:
        """
        Gera visão executiva analítica consolidada para o produtor rural,
        agrupando indicadores operacionais, financeiros, epidemiológicos,
        climáticos e de sustentabilidade ESG.
        """
        # 1. Informações cadastrais da Propriedade
        propriedade = await session.get(Propriedade, propriedade_id)
        if not propriedade:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Propriedade não encontrada"
            )

        # 2. Talhões e Safras
        stmt_talhoes = select(Talhao).where(Talhao.propriedade_id == propriedade_id)
        talhoes = (await session.execute(stmt_talhoes)).scalars().all()
        total_talhoes = len(talhoes)
        area_talhoes = sum(float(t.area_hectares or 0) for t in talhoes)

        stmt_safras = select(Safra).where(
            Safra.propriedade_id == propriedade_id,
            Safra.status.in_(["PLANEJADA", "EM_ANDAMENTO", "COLHEITA"])
        )
        safras = (await session.execute(stmt_safras)).scalars().all()
        safras_ativas = len(safras)
        culturas_em_campo = sorted(list({s.cultura for s in safras if s.cultura}))

        resumo_geral = ResumoPropriedadeGeral(
            propriedade_id=propriedade.id,
            nome=propriedade.nome,
            municipio=propriedade.municipio,
            estado=propriedade.estado,
            area_total_hectares=float(propriedade.area_total_hectares or area_talhoes),
            area_talhoes_hectares=round(area_talhoes, 2),
            total_talhoes=total_talhoes,
            safras_ativas=safras_ativas,
            culturas_em_campo=culturas_em_campo
        )

        # 3. Operacional & Financeiro (Insumos e Maquinários)
        stmt_custo_insumos = select(
            func.sum(AlocacaoInsumo.quantidade * Insumo.preco_unitario)
        ).join(LoteInsumo, AlocacaoInsumo.lote_insumo_id == LoteInsumo.id)\
         .join(Insumo, LoteInsumo.insumo_id == Insumo.id)\
         .where(AlocacaoInsumo.propriedade_id == propriedade_id)
        custo_insumos = await session.scalar(stmt_custo_insumos) or Decimal('0.0')

        stmt_lotes = select(LoteInsumo).where(LoteInsumo.propriedade_id == propriedade_id)
        lotes = (await session.execute(stmt_lotes)).scalars().all()
        total_lotes = len(lotes)
        lotes_baixo = sum(
            1 for l in lotes
            if l.quantidade_atual <= (l.quantidade_inicial * Decimal('0.10'))
        )

        stmt_maq = select(Maquinario).where(Maquinario.propriedade_id == propriedade_id)
        maquinas = (await session.execute(stmt_maq)).scalars().all()
        total_maquinas = len(maquinas)
        maquinas_op = sum(1 for m in maquinas if m.status == "OPERACIONAL")
        maquinas_manut = sum(1 for m in maquinas if m.status in ["MANUTENCAO", "EM_MANUTENCAO", "PARADO"])

        stmt_ordens = select(OrdemManutencao).where(OrdemManutencao.propriedade_id == propriedade_id)
        ordens = (await session.execute(stmt_ordens)).scalars().all()
        ordens_pendentes = sum(1 for o in ordens if o.status == "PENDENTE")
        custo_manut = sum(float(o.custo_real or o.custo_estimado or 0) for o in ordens if o.status == "CONCLUIDA")

        resumo_operacional = ResumoOperacionalFinanceiro(
            custo_insumos_alocados_brl=round(float(custo_insumos), 2),
            total_lotes_estoque=total_lotes,
            lotes_estoque_baixo=lotes_baixo,
            total_maquinarios=total_maquinas,
            maquinas_operacionais=maquinas_op,
            maquinas_em_manutencao=maquinas_manut,
            ordens_manutencao_pendentes=ordens_pendentes,
            custo_total_manutencao_brl=round(custo_manut, 2)
        )

        # 4. Fitossanitário & Alertas
        now_utc = datetime.now(timezone.utc)
        stmt_alertas = select(AlertaEpidemiologico).where(
            AlertaEpidemiologico.propriedade_id == propriedade_id,
            AlertaEpidemiologico.notificado == False
        )
        alertas = (await session.execute(stmt_alertas)).scalars().all()
        score_risco_max = max((float(a.risco_score) for a in alertas), default=0.0)

        if score_risco_max >= 0.75:
            nivel_risco = "CRITICO"
        elif score_risco_max >= 0.50:
            nivel_risco = "ALTO"
        elif score_risco_max >= 0.25:
            nivel_risco = "MODERADO"
        else:
            nivel_risco = "BAIXO"

        limite_30d = now_utc - timedelta(days=30)
        stmt_ocorrencias = select(OcorrenciaSanitaria).where(
            OcorrenciaSanitaria.propriedade_id == propriedade_id,
            OcorrenciaSanitaria.observado_em >= limite_30d
        )
        ocorrencias_30d = (await session.execute(stmt_ocorrencias)).scalars().all()

        agentes_map: dict[str, dict] = {}
        for oc in ocorrencias_30d:
            ag = oc.agente_identificado
            if ag not in agentes_map:
                agentes_map[ag] = {"ocorrencias": 0, "severidades": []}
            agentes_map[ag]["ocorrencias"] += 1
            if oc.severidade:
                agentes_map[ag]["severidades"].append(oc.severidade.upper())

        def max_severidade(sevs: list[str]) -> str:
            ordem = ["CRITICA", "ALTA", "MEDIA", "BAIXA"]
            for o in ordem:
                if o in sevs:
                    return o
            return "BAIXA"

        principais_agentes = [
            AgenteResumo(
                agente=ag,
                ocorrencias=dados["ocorrencias"],
                severidade_max=max_severidade(dados["severidades"])
            )
            for ag, dados in sorted(agentes_map.items(), key=lambda x: x[1]["ocorrencias"], reverse=True)[:5]
        ]

        resumo_epidemiologico = ResumoEpidemiologico(
            nivel_risco_global=nivel_risco,
            score_risco_maximo=round(score_risco_max, 2),
            alertas_ativos=len(alertas),
            ocorrencias_recentes_30d=len(ocorrencias_30d),
            principais_agentes=principais_agentes
        )

        # 5. Sustentabilidade ESG
        stmt_esg = select(RelatorioESG).where(
            RelatorioESG.propriedade_id == propriedade_id
        ).order_by(RelatorioESG.created_at.desc()).limit(1)
        ultimo_esg = (await session.execute(stmt_esg)).scalar_one_or_none()

        if ultimo_esg:
            emissao_tco2e = float(ultimo_esg.emissao_total_co2e_ton)
            emissao_ha = float(ultimo_esg.emissao_por_hectare)
            pct_renovavel = float(ultimo_esg.pct_energia_renovavel)
            elegivel_verde = pct_renovavel >= 50.0 or emissao_ha < 1.5
            periodo_esg = ultimo_esg.periodo
            status_esg = ultimo_esg.status
        else:
            emissao_tco2e = None
            emissao_ha = None
            pct_renovavel = None
            elegivel_verde = False
            periodo_esg = None
            status_esg = None

        resumo_sustentabilidade = ResumoSustentabilidadeESG(
            emissao_recente_tco2e=round(emissao_tco2e, 3) if emissao_tco2e is not None else None,
            emissao_por_hectare=round(emissao_ha, 3) if emissao_ha is not None else None,
            pct_energia_renovavel=round(pct_renovavel, 2) if pct_renovavel is not None else None,
            elegivel_credito_verde=elegivel_verde,
            ultimo_relatorio_periodo=periodo_esg,
            ultimo_relatorio_status=status_esg
        )

        # 6. Clima Recente
        stmt_clima = select(DadosClimaticoCache).order_by(
            DadosClimaticoCache.data_referencia.desc()
        ).limit(1)
        clima_recente = (await session.execute(stmt_clima)).scalar_one_or_none()

        resumo_clima = None
        if clima_recente:
            resumo_clima = ResumoClimaRecente(
                temperatura_c=round(clima_recente.temp_media_c, 1) if clima_recente.temp_media_c is not None else None,
                umidade_relativa_pct=round(clima_recente.umidade_relativa_pct, 1) if clima_recente.umidade_relativa_pct is not None else None,
                precipitacao_mm=round(clima_recente.precipitacao_mm, 1) if clima_recente.precipitacao_mm is not None else None,
                data_referencia=clima_recente.data_referencia.isoformat() if clima_recente.data_referencia else None,
                fonte=clima_recente.fonte
            )

        return DashboardConsolidadoResponse(
            propriedade=resumo_geral,
            operacional=resumo_operacional,
            epidemiologico=resumo_epidemiologico,
            sustentabilidade=resumo_sustentabilidade,
            clima=resumo_clima,
            gerado_em=now_utc
        )
