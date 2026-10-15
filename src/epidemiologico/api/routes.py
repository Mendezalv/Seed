from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.epidemiologico.application.services import VigilanciaService
from src.epidemiologico.domain.models import OcorrenciaSanitaria
from src.epidemiologico.domain.schemas import (
    AlertaEpidemiologicoResponse,
    MapaCalorResponse,
    OcorrenciaSanitariaCreate,
    OcorrenciaSanitariaResponse,
)
from src.shared.api.dependencies import get_current_propriedade_id
from src.shared.database.session import get_session
from src.shared.export.export_engine import ExportEngine
from src.shared.integrations.clima import clima_service
from src.shared.utils.pagination import PaginatedResponse, PaginationParams, paginate

router = APIRouter(prefix="/epidemiologico", tags=["Vigilância Epidemiológica"])


@router.post("/ocorrencias", response_model=OcorrenciaSanitariaResponse)
async def registrar_ocorrencia(
    ocorrencia: OcorrenciaSanitariaCreate,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session),
):
    return await VigilanciaService.registrar_ocorrencia(ocorrencia, propriedade_id, session)


@router.get("/ocorrencias", response_model=PaginatedResponse[OcorrenciaSanitariaResponse])
async def listar_ocorrencias(
    agente: str | None = None,
    pagination: PaginationParams = Depends(),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session),
):
    stmt = select(OcorrenciaSanitaria).where(OcorrenciaSanitaria.propriedade_id == propriedade_id)
    if agente:
        stmt = stmt.where(OcorrenciaSanitaria.agente_identificado == agente)
    stmt = stmt.order_by(OcorrenciaSanitaria.observado_em.desc())
    return await paginate(session, stmt, pagination)


@router.get("/ocorrencias/export/pdf")
async def exportar_laudo_fitossanitario_pdf(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session),
):
    """Gera e exporta laudo técnico oficial fitossanitário em PDF."""
    pdf_bytes = await ExportEngine.gerar_laudo_fitossanitario_pdf(propriedade_id, session)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="laudo_fitossanitario.pdf"'},
    )


@router.get("/alertas", response_model=list[AlertaEpidemiologicoResponse])
async def listar_alertas(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session),
):
    return await VigilanciaService.listar_alertas(propriedade_id, session)


@router.get("/mapa-calor", response_model=MapaCalorResponse)
async def obter_mapa_calor(
    agente: str | None = Query(None, description="Filtrar por agente patogênico"),
    severidade: str | None = Query(
        None, description="Filtrar por severidade (BAIXA, MEDIA, ALTA, CRITICA)"
    ),
    data_inicio: datetime | None = Query(None, description="Data/hora inicial da observação"),
    data_fim: datetime | None = Query(None, description="Data/hora final da observação"),
    min_lat: float | None = Query(
        None, ge=-90.0, le=90.0, description="Latitude mínima (Bounding Box)"
    ),
    max_lat: float | None = Query(
        None, ge=-90.0, le=90.0, description="Latitude máxima (Bounding Box)"
    ),
    min_lon: float | None = Query(
        None, ge=-180.0, le=180.0, description="Longitude mínima (Bounding Box)"
    ),
    max_lon: float | None = Query(
        None, ge=-180.0, le=180.0, description="Longitude máxima (Bounding Box)"
    ),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session),
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
        max_lon=max_lon,
    )


# ─── Telemetria Climática & Cache Redis ───────────────────────


@router.get("/clima/estacao-proxima")
async def obter_estacao_mais_proxima(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Latitude da fazenda em WGS84"),
    longitude: float = Query(
        ..., ge=-180.0, le=180.0, description="Longitude da fazenda em WGS84"
    ),
    max_km: float = Query(250.0, ge=1.0, le=1000.0, description="Distância máxima em km"),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
):
    """Localiza a estação meteorológica oficial mais próxima usando cache e Haversine."""
    estacao, dist_km = await clima_service.encontrar_estacao_mais_proxima(
        latitude, longitude, max_km=max_km
    )
    if not estacao:
        return {
            "encontrada": False,
            "mensagem": "Nenhuma estação meteorológica encontrada no raio estipulado.",
            "estacao": None,
            "distancia_km": None,
        }
    return {
        "encontrada": True,
        "estacao": estacao.model_dump(),
        "distancia_km": dist_km,
    }


@router.get("/clima/cache-stats")
async def obter_estatisticas_cache_clima(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
):
    """Retorna métricas de performance e estado operacional do cache Redis da telemetria."""
    return await clima_service.obter_estatisticas_cache()


@router.delete("/clima/cache")
async def invalidar_cache_clima(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
):
    """Invalida chaves de cache climático (INMET e CPTEC) armazenadas no Redis."""
    chaves_removidas = await clima_service.invalidar_cache_clima()
    return {"status": "ok", "chaves_invalidadas": chaves_removidas}
