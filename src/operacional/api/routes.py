from uuid import UUID
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from src.shared.database.session import get_session
from src.shared.api.dependencies import get_current_propriedade_id
from src.operacional.domain.schemas import (
    LoteInsumoCreate, LoteInsumoResponse,
    AlocacaoInsumoCreate, AlocacaoInsumoResponse,
    ViabilidadeRequest, ViabilidadeResponse,
    MaquinarioResponse, OrdemManutencaoResponse
)
from src.operacional.application.rastreabilidade import RastreabilidadeService
from src.operacional.application.viabilidade import ViabilidadeService
from src.operacional.application.manutencao import ManutencaoService

router = APIRouter(prefix="/operacional", tags=["Operacional"])

@router.post("/insumos/lotes", response_model=LoteInsumoResponse)
async def registrar_entrada_insumo(
    lote: LoteInsumoCreate,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await RastreabilidadeService.registrar_entrada_insumo(lote, propriedade_id, session)

@router.post("/insumos/alocacoes", response_model=AlocacaoInsumoResponse)
async def alocar_insumo(
    alocacao: AlocacaoInsumoCreate,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await RastreabilidadeService.alocar_insumo(alocacao, propriedade_id, session)

@router.get("/insumos/rastreabilidade/{talhao_id}", response_model=List[AlocacaoInsumoResponse])
async def consultar_rastreabilidade(
    talhao_id: UUID = Path(...),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await RastreabilidadeService.consultar_rastreabilidade_talhao(talhao_id, propriedade_id, session)

@router.get("/insumos/estoques-baixos", response_model=List[LoteInsumoResponse])
async def verificar_estoques_baixos(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await RastreabilidadeService.verificar_estoques_baixos(propriedade_id, session)

@router.post("/viabilidade/calcular", response_model=ViabilidadeResponse)
async def calcular_viabilidade(
    request: ViabilidadeRequest,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    from fastapi import HTTPException
    try:
        return await ViabilidadeService.calcular_viabilidade(request, propriedade_id, session)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.patch("/maquinarios/{id}/horimetro", response_model=MaquinarioResponse)
async def atualizar_horimetro(
    horas: Decimal = Query(..., gt=0),
    id: UUID = Path(...),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await ManutencaoService.atualizar_horimetro(id, horas, propriedade_id, session)

from src.shared.utils.pagination import PaginationParams, PaginatedResponse, paginate

@router.get("/manutencao/ordens", response_model=PaginatedResponse[OrdemManutencaoResponse])
async def listar_ordens(
    status: Optional[str] = None,
    pagination: PaginationParams = Depends(),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    from sqlalchemy import select
    from src.operacional.domain.models import OrdemManutencao
    stmt = select(OrdemManutencao).where(OrdemManutencao.propriedade_id == propriedade_id)
    if status:
        stmt = stmt.where(OrdemManutencao.status == status)
    stmt = stmt.order_by(OrdemManutencao.created_at.desc())
    return await paginate(session, stmt, pagination)

@router.patch("/manutencao/ordens/{id}/concluir", response_model=OrdemManutencaoResponse)
async def concluir_ordem(
    custo_real: Decimal = Query(..., ge=0),
    id: UUID = Path(...),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await ManutencaoService.concluir_ordem(id, custo_real, propriedade_id, session)
