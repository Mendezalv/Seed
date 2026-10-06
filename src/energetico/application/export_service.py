"""
Serviço emissor de Laudos e Relatórios de Sustentabilidade e Crédito Verde (Plano ABC+ / ESG).
Gera dados estruturados e exportação formatada para apresentação junto a agentes financeiros.
"""

from uuid import UUID
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from src.energetico.domain.models import RelatorioESG
from src.shared.database.models import Propriedade


class RelatorioESGExportService:
    """
    Serviço responsável por compilar e emitir o Laudo de Conformidade ESG e Crédito Rural Verde.
    """

    @staticmethod
    async def gerar_laudo_credito_verde(
        relatorio_id: UUID,
        propriedade_id: UUID,
        session: AsyncSession
    ) -> dict:
        relatorio = await session.get(RelatorioESG, relatorio_id)
        if not relatorio or relatorio.propriedade_id != propriedade_id:
            raise HTTPException(status_code=404, detail="Relatório ESG não encontrado.")

        propriedade = await session.get(Propriedade, propriedade_id)
        if not propriedade:
            raise HTTPException(status_code=404, detail="Propriedade não encontrada.")

        pct_renovavel = float(relatorio.pct_energia_renovavel or Decimal("0"))
        emissao_ton = float(relatorio.emissao_total_co2e_ton or Decimal("0"))
        emissao_ha = float(relatorio.emissao_por_hectare or Decimal("0"))

        # Critérios de Elegibilidade para Crédito Verde (Linha ABC+ / Financiamento Sustentável)
        # > 60% Renovável = Nível A, > 30% = Nível B, menor = Em Transição
        if pct_renovavel >= 60.0:
            rating_esg = "A+"
            classificacao_abc = "Elegível com Bônus Máximo (Taxa Reduzida)"
            desconto_juros_estimado_pct = 1.0  # -1.0% a.a. na taxa de juros do crédito rural
        elif pct_renovavel >= 30.0:
            rating_esg = "B"
            classificacao_abc = "Elegível (Transição Energética em Andamento)"
            desconto_juros_estimado_pct = 0.5  # -0.5% a.a.
        else:
            rating_esg = "C"
            classificacao_abc = "Em Adequação (Plano de Mitigação Requerido)"
            desconto_juros_estimado_pct = 0.0

        # Estimativa de Créditos de Descarbonização (CBios) potenciais
        # Estimativa de baseline: 1 CBio = 1 tCO2e evitada em relação a 100% fóssil
        cbios_estimados = round(max((emissao_ton * 0.4), 0.0), 2)

        detalhes_matriz = (relatorio.indicadores_detalhados or {}).get("matriz", {})

        return {
            "documento": {
                "tipo": "Laudo Técnico de Conformidade ESG e Eficiência Energética",
                "versao_normativa": "Plano ABC+ / GHG Protocol Agrícola 2026",
                "emitido_em": datetime.now(timezone.utc).isoformat(),
                "status_relatorio": relatorio.status,
            },
            "propriedade": {
                "id": str(propriedade.id),
                "nome": propriedade.nome,
                "cnpj_cpf": propriedade.cnpj_cpf,
                "car_numero": propriedade.car_numero,
                "municipio": propriedade.municipio,
                "estado": propriedade.estado,
                "area_total_hectares": float(propriedade.area_total_hectares or Decimal("0")),
            },
            "indicadores_ambientais": {
                "periodo_referencia": relatorio.periodo,
                "emissao_total_tco2e": round(emissao_ton, 3),
                "emissao_por_hectare_tco2e": round(emissao_ha, 4),
                "percentual_energia_renovavel": round(pct_renovavel, 2),
                "percentual_energia_fossil": round(float(detalhes_matriz.get("percentual_fossil", 100.0 - pct_renovavel)), 2),
                "detalhamento_fontes": detalhes_matriz.get("breakdown_fontes", {}),
            },
            "enquadramento_financeiro_verde": {
                "rating_esg": rating_esg,
                "status_plano_abc": classificacao_abc,
                "beneficio_estimado_taxa_juros": f"-{desconto_juros_estimado_pct}% a.a.",
                "potencial_cbios": cbios_estimados,
            },
            "declaracao_validade": (
                "Este relatório foi processado automaticamente pelo motor de inteligência e auditoria "
                "da plataforma Seed utilizando os fatores oficiais de emissão do MCTI e balanço energético rural."
            ),
        }
