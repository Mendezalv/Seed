from uuid import UUID
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.energetico.domain.models import FonteEnergia, ConsumoEnergia, RelatorioESG
from src.operacional.domain.models import Talhao

class CalculadoraESG:
    FATORES_EMISSAO = {
        'DIESEL': 2.603,
        'GASOLINA': 2.212,
        'ETANOL': 0.029,
        'GAS_NATURAL': 2.133,
        'SOLAR': 0.0,
        'BIOMASSA': 0.015,
        'EOLICA': 0.0,
        'REDE_ELETRICA': 0.0817
    }

    CONVERSAO_KWH = {
        'litros_DIESEL': 10.0,
        'litros_GASOLINA': 8.9,
        'litros_ETANOL': 6.1,
        'm3_GAS_NATURAL': 10.5,
        'kg_BIOMASSA': 4.8,
        'kWh_SOLAR': 1.0,
        'kWh_EOLICA': 1.0,
        'kWh_REDE_ELETRICA': 1.0
    }

    @staticmethod
    def _converter_para_kwh(quantidade: float, tipo_fonte: str, unidade: str) -> float:
        chave = f"{unidade}_{tipo_fonte}"
        fator = CalculadoraESG.CONVERSAO_KWH.get(chave, 1.0)
        return quantidade * fator

    @staticmethod
    async def calcular_matriz_energetica(propriedade_id: UUID, periodo: str, session: AsyncSession) -> dict:
        stmt = select(ConsumoEnergia, FonteEnergia).join(
            FonteEnergia, ConsumoEnergia.fonte_id == FonteEnergia.id
        ).where(
            ConsumoEnergia.propriedade_id == propriedade_id
        )
        # simplistic period filter
        if periodo:
            stmt = stmt.where(func.to_char(ConsumoEnergia.periodo_inicio, 'YYYY-MM') == periodo)

        result = await session.execute(stmt)
        consumos = result.all()

        total_kwh = 0.0
        kwh_renovavel = 0.0
        kwh_fossil = 0.0
        breakdown = {}

        for consumo, fonte in consumos:
            qtd = float(consumo.quantidade_consumida)
            kwh = CalculadoraESG._converter_para_kwh(qtd, fonte.tipo, fonte.unidade_medida)
            total_kwh += kwh
            
            if fonte.categoria == 'RENOVAVEL':
                kwh_renovavel += kwh
            else:
                kwh_fossil += kwh
                
            breakdown[fonte.tipo] = breakdown.get(fonte.tipo, 0.0) + kwh

        for k in breakdown:
            breakdown[k] = (breakdown[k] / total_kwh * 100.0) if total_kwh > 0 else 0.0

        return {
            "total_kwh": total_kwh,
            "percentual_renovavel": (kwh_renovavel / total_kwh * 100.0) if total_kwh > 0 else 0.0,
            "percentual_fossil": (kwh_fossil / total_kwh * 100.0) if total_kwh > 0 else 0.0,
            "breakdown_fontes": breakdown
        }

    @staticmethod
    async def gerar_relatorio(propriedade_id: UUID, periodo: str, session: AsyncSession) -> RelatorioESG:
        stmt = select(ConsumoEnergia, FonteEnergia).join(
            FonteEnergia, ConsumoEnergia.fonte_id == FonteEnergia.id
        ).where(ConsumoEnergia.propriedade_id == propriedade_id)
        
        if periodo:
            stmt = stmt.where(func.to_char(ConsumoEnergia.periodo_inicio, 'YYYY-MM') == periodo)

        result = await session.execute(stmt)
        consumos = result.all()

        emissao_total_kg = 0.0
        for consumo, fonte in consumos:
            qtd = float(consumo.quantidade_consumida)
            fator = CalculadoraESG.FATORES_EMISSAO.get(fonte.tipo, fonte.fator_emissao_co2)
            emissao_total_kg += qtd * fator

        emissao_total_ton = Decimal(str(emissao_total_kg / 1000.0))

        # Obter area total
        stmt_area = select(func.sum(Talhao.area_hectares)).where(Talhao.propriedade_id == propriedade_id)
        res_area = await session.execute(stmt_area)
        area_total = res_area.scalar() or Decimal('1.0')

        emissao_por_ha = emissao_total_ton / area_total if area_total > 0 else Decimal('0')

        matriz = await CalculadoraESG.calcular_matriz_energetica(propriedade_id, periodo, session)
        pct_renovavel = Decimal(str(matriz['percentual_renovavel']))

        relatorio = RelatorioESG(
            propriedade_id=propriedade_id,
            periodo=periodo,
            emissao_total_co2e_ton=emissao_total_ton,
            emissao_por_hectare=emissao_por_ha,
            pct_energia_renovavel=pct_renovavel,
            intensidade_carbono=None,
            indicadores_detalhados={"matriz": matriz},
            status="RASCUNHO"
        )
        session.add(relatorio)
        await session.flush()
        return relatorio

    @staticmethod
    async def estimar_creditos_cbio(propriedade_id: UUID, periodo: str, session: AsyncSession) -> float:
        # Simplificacao: 1 CBIO = 1 ton CO2 evitada
        # Assume baseline fossil de 1000 ton
        relatorio = await CalculadoraESG.gerar_relatorio(propriedade_id, periodo, session)
        baseline_fossil = float(relatorio.emissao_total_co2e_ton) * 1.5 
        evitado = baseline_fossil - float(relatorio.emissao_total_co2e_ton)
        return max(evitado, 0.0)
