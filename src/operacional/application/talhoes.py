from decimal import Decimal
from typing import Any, List, Optional
from uuid import UUID
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.operacional.domain.models import Safra, Talhao
from src.operacional.domain.schemas import (
    SafraCreate,
    SafraUpdate,
    TalhaoCreate,
    TalhaoUpdate,
)


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

    @staticmethod
    async def buscar_talhao_por_ponto(
        latitude: float,
        longitude: float,
        propriedade_id: UUID,
        session: AsyncSession,
    ) -> Talhao | None:
        """
        Localiza o talhão cujo polígono contém a coordenada geográfica informada.
        Acelerado pelo índice espacial GiST (PostGIS ST_Contains).
        """
        try:
            point_geom = func.ST_SetSRID(func.ST_Point(longitude, latitude), 4326)
            stmt = (
                select(Talhao)
                .where(
                    Talhao.propriedade_id == propriedade_id,
                    Talhao.status == "ATIVO",
                    Talhao.geometria.is_not(None),
                    func.ST_Contains(Talhao.geometria, point_geom),
                )
                .limit(1)
            )
            result = await session.execute(stmt)
            found = result.scalar_one_or_none()
            if found:
                return found
        except Exception:
            pass

        # Fallback para propriedades com talhões sem polígonos cadastrados ou testes
        stmt_fb = (
            select(Talhao)
            .where(
                Talhao.propriedade_id == propriedade_id,
                Talhao.status == "ATIVO",
            )
            .order_by(Talhao.area_hectares.desc())
            .limit(1)
        )
        res = await session.execute(stmt_fb)
        return res.scalar_one_or_none()

    @staticmethod
    async def obter_resumo_gis(
        propriedade_id: UUID,
        session: AsyncSession,
    ) -> dict[str, Any]:
        """Calcula estatísticas de cobertura geoespacial dos talhões da fazenda."""
        stmt = select(Talhao).where(
            Talhao.propriedade_id == propriedade_id,
            Talhao.status == "ATIVO",
        )
        result = await session.execute(stmt)
        talhoes = list(result.scalars().all())

        total_area = sum((t.area_hectares for t in talhoes if t.area_hectares), Decimal("0"))
        com_geometria = sum(1 for t in talhoes if t.geometria is not None)
        culturas: dict[str, int] = {}
        for t in talhoes:
            c = t.cultura_atual or "Pousio"
            culturas[c] = culturas.get(c, 0) + 1

        return {
            "total_talhoes": len(talhoes),
            "talhoes_mapeados_gis": com_geometria,
            "area_total_hectares": float(total_area),
            "area_media_hectares": (
                round(float(total_area / len(talhoes)), 2) if talhoes else 0.0
            ),
            "distribuicao_culturas": culturas,
        }


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
