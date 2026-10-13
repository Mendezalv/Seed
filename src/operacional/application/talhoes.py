from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from src.operacional.domain.models import Talhao, Safra
from src.operacional.domain.schemas import TalhaoCreate, TalhaoUpdate, SafraCreate, SafraUpdate


class TalhoesService:
    @staticmethod
    async def listar_talhoes(propriedade_id: UUID, session: AsyncSession) -> List[Talhao]:
        stmt = select(Talhao).where(Talhao.propriedade_id == propriedade_id).order_by(Talhao.nome)
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def criar_talhao(talhao_in: TalhaoCreate, propriedade_id: UUID, session: AsyncSession) -> Talhao:
        dados = talhao_in.model_dump(exclude={"geometria"})
        novo_talhao = Talhao(**dados, propriedade_id=propriedade_id)
        session.add(novo_talhao)
        await session.flush()
        return novo_talhao

    @staticmethod
    async def obter_talhao(talhao_id: UUID, propriedade_id: UUID, session: AsyncSession) -> Optional[Talhao]:
        stmt = select(Talhao).where(Talhao.id == talhao_id, Talhao.propriedade_id == propriedade_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def excluir_talhao(talhao_id: UUID, propriedade_id: UUID, session: AsyncSession) -> bool:
        talhao = await TalhoesService.obter_talhao(talhao_id, propriedade_id, session)
        if not talhao:
            return False
        talhao.status = "INATIVO"
        await session.flush()
        return True


class SafrasService:
    @staticmethod
    async def listar_safras(propriedade_id: UUID, session: AsyncSession) -> List[Safra]:
        stmt = select(Safra).where(Safra.propriedade_id == propriedade_id).order_by(Safra.data_plantio.desc())
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def criar_safra(safra_in: SafraCreate, propriedade_id: UUID, session: AsyncSession) -> Safra:
        nova_safra = Safra(**safra_in.model_dump(), propriedade_id=propriedade_id)
        session.add(nova_safra)
        await session.flush()
        return nova_safra

    @staticmethod
    async def atualizar_safra(safra_id: UUID, safra_in: SafraUpdate, propriedade_id: UUID, session: AsyncSession) -> Optional[Safra]:
        stmt = select(Safra).where(Safra.id == safra_id, Safra.propriedade_id == propriedade_id)
        result = await session.execute(stmt)
        safra = result.scalar_one_or_none()
        if not safra:
            return None
        
        for k, v in safra_in.model_dump(exclude_unset=True).items():
            setattr(safra, k, v)
        
        await session.flush()
        return safra
