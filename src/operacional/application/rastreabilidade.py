from uuid import UUID
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.operacional.domain.models import LoteInsumo, AlocacaoInsumo
from src.operacional.domain.schemas import LoteInsumoCreate, AlocacaoInsumoCreate

class RastreabilidadeService:
    @staticmethod
    async def registrar_entrada_insumo(lote_in: LoteInsumoCreate, propriedade_id: UUID, session: AsyncSession) -> LoteInsumo:
        novo_lote = LoteInsumo(**lote_in.model_dump(), propriedade_id=propriedade_id)
        session.add(novo_lote)
        await session.flush()
        return novo_lote

    @staticmethod
    async def alocar_insumo(alocacao_in: AlocacaoInsumoCreate, propriedade_id: UUID, session: AsyncSession) -> AlocacaoInsumo:
        lote = await session.get(LoteInsumo, alocacao_in.lote_insumo_id)
        if not lote:
            raise ValueError("Lote não encontrado.")
        if lote.propriedade_id != propriedade_id:
            raise ValueError("Lote pertence a outra propriedade.")
        if lote.quantidade_atual < alocacao_in.quantidade:
            raise ValueError(f"Quantidade insuficiente no lote. Atual: {lote.quantidade_atual}")

        lote.quantidade_atual -= alocacao_in.quantidade
        
        nova_alocacao = AlocacaoInsumo(**alocacao_in.model_dump(), propriedade_id=propriedade_id)
        session.add(nova_alocacao)
        await session.flush()
        return nova_alocacao

    @staticmethod
    async def consultar_rastreabilidade_talhao(talhao_id: UUID, propriedade_id: UUID, session: AsyncSession) -> list[AlocacaoInsumo]:
        stmt = select(AlocacaoInsumo).where(
            AlocacaoInsumo.talhao_id == talhao_id,
            AlocacaoInsumo.propriedade_id == propriedade_id
        ).order_by(AlocacaoInsumo.aplicado_em.desc())
        
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def verificar_estoques_baixos(propriedade_id: UUID, session: AsyncSession) -> list[LoteInsumo]:
        # Consideramos baixo se quantidade_atual <= quantidade_inicial * 0.15
        stmt = select(LoteInsumo).where(
            LoteInsumo.propriedade_id == propriedade_id,
            LoteInsumo.quantidade_atual <= (LoteInsumo.quantidade_inicial * Decimal('0.15'))
        )
        result = await session.execute(stmt)
        return list(result.scalars().all())
