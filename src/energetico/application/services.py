from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.energetico.domain.models import ConsumoEnergia, RelatorioESG
from src.energetico.domain.schemas import ConsumoEnergiaCreate
from src.energetico.domain.calculadora_esg import CalculadoraESG

class EnergiaService:
    @staticmethod
    async def registrar_consumo(consumo: ConsumoEnergiaCreate, propriedade_id: UUID, session: AsyncSession) -> ConsumoEnergia:
        novo_consumo = ConsumoEnergia(**consumo.model_dump(), propriedade_id=propriedade_id)
        session.add(novo_consumo)
        await session.flush()
        return novo_consumo

    @staticmethod
    async def obter_matriz_energetica(propriedade_id: UUID, periodo: str, session: AsyncSession) -> dict:
        return await CalculadoraESG.calcular_matriz_energetica(propriedade_id, periodo, session)

    @staticmethod
    async def gerar_relatorio_esg(propriedade_id: UUID, periodo: str, session: AsyncSession) -> RelatorioESG:
        return await CalculadoraESG.gerar_relatorio(propriedade_id, periodo, session)

    @staticmethod
    async def listar_relatorios(propriedade_id: UUID, session: AsyncSession) -> list[RelatorioESG]:
        stmt = select(RelatorioESG).where(RelatorioESG.propriedade_id == propriedade_id).order_by(RelatorioESG.created_at.desc())
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def publicar_relatorio(relatorio_id: UUID, propriedade_id: UUID, session: AsyncSession) -> RelatorioESG:
        relatorio = await session.get(RelatorioESG, relatorio_id)
        if not relatorio or relatorio.propriedade_id != propriedade_id:
            raise ValueError("Relatório não encontrado.")
            
        relatorio.status = "PUBLICADO"
        await session.flush()
        return relatorio
