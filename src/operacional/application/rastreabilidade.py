from __future__ import annotations

from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.operacional.domain.models import AlocacaoInsumo, LoteInsumo
from src.operacional.domain.schemas import AlocacaoInsumoCreate, LoteInsumoCreate

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

    @staticmethod
    async def listar_lotes(propriedade_id: UUID, session: AsyncSession) -> list[LoteInsumo]:
        stmt = select(LoteInsumo).where(LoteInsumo.propriedade_id == propriedade_id).order_by(LoteInsumo.entrada_em.desc())
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def importar_itens_nfe(
        itens: list[Any],
        fornecedor_padrao: str | None,
        propriedade_id: UUID,
        session: AsyncSession,
    ) -> list[LoteInsumo]:
        from datetime import datetime, timezone
        from src.operacional.domain.models import Insumo

        lotes_criados: list[LoteInsumo] = []
        for item in itens:
            # 1. Localiza ou cria o catálogo de Insumo
            stmt_insumo = select(Insumo).where(Insumo.nome.ilike(item.nome_produto.strip()))
            res_insumo = await session.execute(stmt_insumo)
            insumo = res_insumo.scalar_one_or_none()

            if not insumo:
                insumo = Insumo(
                    tipo=item.categoria,
                    nome=item.nome_produto.strip(),
                    unidade_medida=item.unidade,
                    preco_unitario=item.custo_unitario,
                )
                session.add(insumo)
                await session.flush()

            # 2. Cria o novo lote
            lote = LoteInsumo(
                insumo_id=insumo.id,
                codigo_lote=item.codigo_lote,
                quantidade_inicial=item.quantidade,
                quantidade_atual=item.quantidade,
                data_validade=item.data_validade,
                fornecedor=item.fornecedor or fornecedor_padrao or "NF-e Fornecedor",
                entrada_em=datetime.now(timezone.utc),
                propriedade_id=propriedade_id,
            )
            session.add(lote)
            lotes_criados.append(lote)

        await session.flush()
        return lotes_criados
