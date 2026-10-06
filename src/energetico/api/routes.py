from uuid import UUID
from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from src.shared.database.session import get_session
from src.shared.api.dependencies import get_current_propriedade_id
from src.energetico.domain.schemas import (
    ConsumoEnergiaCreate, ConsumoEnergiaResponse,
    RelatorioESGResponse, MatrizEnergeticaResponse
)
from src.energetico.application.services import EnergiaService

router = APIRouter(prefix="/energetico", tags=["Transição Energética"])

@router.post("/consumos", response_model=ConsumoEnergiaResponse)
async def registrar_consumo(
    consumo: ConsumoEnergiaCreate,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await EnergiaService.registrar_consumo(consumo, propriedade_id, session)

@router.get("/matriz-energetica", response_model=MatrizEnergeticaResponse)
async def obter_matriz_energetica(
    periodo: str = Query(None, description="Formato YYYY-MM"),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    matriz = await EnergiaService.obter_matriz_energetica(propriedade_id, periodo, session)
    return MatrizEnergeticaResponse(**matriz)

@router.post("/relatorios/gerar", response_model=RelatorioESGResponse)
async def gerar_relatorio_esg(
    periodo: str = Query(..., description="Formato YYYY-MM"),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await EnergiaService.gerar_relatorio_esg(propriedade_id, periodo, session)

from src.shared.utils.pagination import PaginationParams, PaginatedResponse, paginate

@router.get("/relatorios", response_model=PaginatedResponse[RelatorioESGResponse])
async def listar_relatorios(
    pagination: PaginationParams = Depends(),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    from sqlalchemy import select
    from src.energetico.domain.models import RelatorioESG
    stmt = select(RelatorioESG).where(RelatorioESG.propriedade_id == propriedade_id).order_by(RelatorioESG.created_at.desc())
    return await paginate(session, stmt, pagination)

@router.patch("/relatorios/{id}/publicar", response_model=RelatorioESGResponse)
async def publicar_relatorio(
    id: UUID = Path(...),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await EnergiaService.publicar_relatorio(id, propriedade_id, session)
