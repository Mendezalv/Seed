from uuid import UUID
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.operacional.domain.models import Maquinario, OrdemManutencao

class ManutencaoService:
    @staticmethod
    async def verificar_preventivas(propriedade_id: UUID, session: AsyncSession) -> list[OrdemManutencao]:
        stmt = select(Maquinario).where(
            Maquinario.propriedade_id == propriedade_id,
            Maquinario.horimetro_atual >= Maquinario.proximo_servico_em,
            Maquinario.status == "OPERACIONAL"
        )
        result = await session.execute(stmt)
        maquinas = result.scalars().all()
        
        novas_ordens = []
        for maq in maquinas:
            om = OrdemManutencao(
                maquinario_id=maq.id,
                propriedade_id=propriedade_id,
                tipo="PREVENTIVA",
                descricao="Manutenção preventiva programada baseada no horímetro.",
                horimetro_na_abertura=maq.horimetro_atual,
                status="PENDENTE",
                prioridade="MEDIA"
            )
            maq.status = "MANUTENCAO"
            maq.proximo_servico_em = maq.horimetro_atual + maq.intervalo_preventiva
            session.add(om)
            novas_ordens.append(om)
            
        await session.flush()
        return novas_ordens

    @staticmethod
    async def atualizar_horimetro(maquinario_id: UUID, horas: Decimal, propriedade_id: UUID, session: AsyncSession) -> Maquinario:
        maq = await session.get(Maquinario, maquinario_id)
        if not maq or maq.propriedade_id != propriedade_id:
            raise ValueError("Maquinário não encontrado.")
        
        maq.horimetro_atual += horas
        await session.flush()
        return maq

    @staticmethod
    async def concluir_ordem(ordem_id: UUID, custo_real: Decimal, propriedade_id: UUID, session: AsyncSession) -> OrdemManutencao:
        om = await session.get(OrdemManutencao, ordem_id)
        if not om or om.propriedade_id != propriedade_id:
            raise ValueError("Ordem não encontrada.")
            
        om.status = "CONCLUIDA"
        om.concluida_em = datetime.now(timezone.utc)
        om.custo_real = custo_real
        
        maq = await session.get(Maquinario, om.maquinario_id)
        if maq:
            maq.status = "OPERACIONAL"
            
        await session.flush()
        return om

    @staticmethod
    async def listar_ordens(propriedade_id: UUID, status: str | None, session: AsyncSession) -> list[OrdemManutencao]:
        stmt = select(OrdemManutencao).where(OrdemManutencao.propriedade_id == propriedade_id)
        if status:
            stmt = stmt.where(OrdemManutencao.status == status)
        stmt = stmt.order_by(OrdemManutencao.created_at.desc())
        
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def listar_maquinarios(propriedade_id: UUID, session: AsyncSession) -> list[Maquinario]:
        stmt = select(Maquinario).where(Maquinario.propriedade_id == propriedade_id).order_by(Maquinario.nome)
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def criar_maquinario(maquinario_in, propriedade_id: UUID, session: AsyncSession) -> Maquinario:
        novo = Maquinario(**maquinario_in.model_dump(), propriedade_id=propriedade_id)
        session.add(novo)
        await session.flush()
        return novo

    @staticmethod
    async def criar_ordem(ordem_in, propriedade_id: UUID, session: AsyncSession) -> OrdemManutencao:
        nova_om = OrdemManutencao(**ordem_in.model_dump(), propriedade_id=propriedade_id)
        maq = await session.get(Maquinario, nova_om.maquinario_id)
        if maq:
            maq.status = "MANUTENCAO"
        session.add(nova_om)
        await session.flush()
        return nova_om
