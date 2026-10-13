from uuid import UUID
from fastapi import APIRouter, Depends, Query, Path, Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from src.shared.export.export_engine import ExportEngine
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

@router.get("/relatorios/{id}/laudo-credito-verde")
async def obter_laudo_credito_verde(
    id: UUID = Path(...),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """
    Gera o Laudo Técnico e Parecer de Elegibilidade para Crédito Rural Verde (Plano ABC+).
    Retorna indicadores consolidados de transição energética, rating ESG e bônus de juros.
    """
    from src.energetico.application.export_service import RelatorioESGExportService
    return await RelatorioESGExportService.gerar_laudo_credito_verde(id, propriedade_id, session)

@router.get("/relatorios/export/pdf")
async def exportar_laudo_esg_ultimo_pdf(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Gera e exporta laudo técnico oficial em PDF do último período auditado."""
    pdf_bytes = await ExportEngine.gerar_laudo_esg_pdf(propriedade_id, session)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="laudo_credito_verde_esg.pdf"'}
    )

@router.get("/relatorios/{id}/export/pdf")
async def exportar_laudo_esg_pdf(
    id: UUID = Path(...),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Gera e exporta laudo técnico oficial em PDF de conformidade ESG e Crédito Rural Verde."""
    pdf_bytes = await ExportEngine.gerar_laudo_esg_pdf(propriedade_id, session, relatorio_id=id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="laudo_credito_verde_esg_{id}.pdf"'}
    )

