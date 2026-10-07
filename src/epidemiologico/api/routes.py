from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from src.shared.database.session import get_session
from src.shared.api.dependencies import get_current_propriedade_id
from datetime import datetime
from src.epidemiologico.domain.schemas import (
    OcorrenciaSanitariaCreate, OcorrenciaSanitariaResponse,
    AlertaEpidemiologicoResponse, MapaCalorResponse
)
from src.epidemiologico.application.services import VigilanciaService

router = APIRouter(prefix="/epidemiologico", tags=["Vigilância Epidemiológica"])

@router.post("/ocorrencias", response_model=OcorrenciaSanitariaResponse)
async def registrar_ocorrencia(
    ocorrencia: OcorrenciaSanitariaCreate,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await VigilanciaService.registrar_ocorrencia(ocorrencia, propriedade_id, session)

from src.shared.utils.pagination import PaginationParams, PaginatedResponse, paginate

@router.get("/ocorrencias", response_model=PaginatedResponse[OcorrenciaSanitariaResponse])
async def listar_ocorrencias(
    agente: Optional[str] = None,
    pagination: PaginationParams = Depends(),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    from sqlalchemy import select
    from src.epidemiologico.domain.models import OcorrenciaSanitaria
    stmt = select(OcorrenciaSanitaria).where(OcorrenciaSanitaria.propriedade_id == propriedade_id)
    if agente:
        stmt = stmt.where(OcorrenciaSanitaria.agente_identificado == agente)
    stmt = stmt.order_by(OcorrenciaSanitaria.observado_em.desc())
    return await paginate(session, stmt, pagination)

@router.get("/alertas", response_model=List[AlertaEpidemiologicoResponse])
async def listar_alertas(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await VigilanciaService.listar_alertas(propriedade_id, session)

@router.get("/mapa-calor", response_model=MapaCalorResponse)
async def obter_mapa_calor(
    agente: Optional[str] = Query(None, description="Filtrar por agente patogênico"),
    severidade: Optional[str] = Query(None, description="Filtrar por severidade (BAIXA, MEDIA, ALTA, CRITICA)"),
    data_inicio: Optional[datetime] = Query(None, description="Data/hora inicial da observação"),
    data_fim: Optional[datetime] = Query(None, description="Data/hora final da observação"),
    min_lat: Optional[float] = Query(None, ge=-90.0, le=90.0, description="Latitude mínima (Bounding Box)"),
    max_lat: Optional[float] = Query(None, ge=-90.0, le=90.0, description="Latitude máxima (Bounding Box)"),
    min_lon: Optional[float] = Query(None, ge=-180.0, le=180.0, description="Longitude mínima (Bounding Box)"),
    max_lon: Optional[float] = Query(None, ge=-180.0, le=180.0, description="Longitude máxima (Bounding Box)"),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await VigilanciaService.obter_mapa_calor(
        propriedade_id=propriedade_id,
        session=session,
        agente=agente,
        severidade=severidade,
        data_inicio=data_inicio,
        data_fim=data_fim,
        min_lat=min_lat,
        max_lat=max_lat,
        min_lon=min_lon,
        max_lon=max_lon
    )
