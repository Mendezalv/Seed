from uuid import UUID
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, Path, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from src.shared.database.session import get_session
from src.shared.api.dependencies import get_current_propriedade_id
from src.operacional.domain.schemas import (
    LoteInsumoCreate, LoteInsumoResponse,
    AlocacaoInsumoCreate, AlocacaoInsumoResponse,
    TalhaoCreate, TalhaoResponse, TalhaoUpdate,
    SafraCreate, SafraResponse, SafraUpdate,
    MaquinarioCreate, MaquinarioResponse,
    OrdemManutencaoCreate, OrdemManutencaoResponse,
    ViabilidadeRequest, ViabilidadeResponse,
)
from src.operacional.application.rastreabilidade import RastreabilidadeService
from src.operacional.application.viabilidade import ViabilidadeService
from src.operacional.application.manutencao import ManutencaoService
from src.operacional.application.talhoes import TalhoesService, SafrasService
from src.shared.utils.pagination import PaginationParams, PaginatedResponse, paginate

router = APIRouter(prefix="/operacional", tags=["Operacional"])


# ─── Talhões & GIS ───────────────────────────────────────────

@router.get("/talhoes", response_model=List[TalhaoResponse])
async def listar_talhoes(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Lista todos os talhões cadastrados na propriedade."""
    return await TalhoesService.listar_talhoes(propriedade_id, session)

@router.post("/talhoes", response_model=TalhaoResponse, status_code=status.HTTP_201_CREATED)
async def criar_talhao(
    talhao_in: TalhaoCreate,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Cadastra um novo talhão."""
    return await TalhoesService.criar_talhao(talhao_in, propriedade_id, session)

@router.get("/talhoes/{talhao_id}", response_model=TalhaoResponse)
async def obter_talhao(
    talhao_id: UUID = Path(...),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Obtém detalhes de um talhão específico."""
    talhao = await TalhoesService.obter_talhao(talhao_id, propriedade_id, session)
    if not talhao:
        raise HTTPException(status_code=404, detail="Talhão não encontrado")
    return talhao

@router.delete("/talhoes/{talhao_id}")
async def excluir_talhao(
    talhao_id: UUID = Path(...),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Desativa um talhão."""
    sucesso = await TalhoesService.excluir_talhao(talhao_id, propriedade_id, session)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Talhão não encontrado")
    return {"status": "ok", "mensagem": "Talhão desativado"}


# ─── Planejamento de Safras ─────────────────────────────────

@router.get("/safras", response_model=List[SafraResponse])
async def listar_safras(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Lista todas as safras e ciclos agronômicos da propriedade."""
    return await SafrasService.listar_safras(propriedade_id, session)

@router.post("/safras", response_model=SafraResponse, status_code=status.HTTP_201_CREATED)
async def criar_safra(
    safra_in: SafraCreate,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Cadastra um novo ciclo de safra."""
    return await SafrasService.criar_safra(safra_in, propriedade_id, session)

@router.patch("/safras/{safra_id}", response_model=SafraResponse)
async def atualizar_safra(
    safra_in: SafraUpdate,
    safra_id: UUID = Path(...),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Atualiza dados ou status de uma safra."""
    safra = await SafrasService.atualizar_safra(safra_id, safra_in, propriedade_id, session)
    if not safra:
        raise HTTPException(status_code=404, detail="Safra não encontrada")
    return safra


# ─── Insumos & Lotes ────────────────────────────────────────

@router.get("/insumos/lotes", response_model=List[LoteInsumoResponse])
async def listar_lotes_insumo(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Lista todos os lotes de insumos cadastrados na propriedade."""
    return await RastreabilidadeService.listar_lotes(propriedade_id, session)

@router.post("/insumos/lotes", response_model=LoteInsumoResponse, status_code=status.HTTP_201_CREATED)
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


# ─── Maquinários & Frotas ───────────────────────────────────

@router.get("/maquinarios", response_model=List[MaquinarioResponse])
async def listar_maquinarios(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Lista todos os maquinários e implementos da fazenda."""
    return await ManutencaoService.listar_maquinarios(propriedade_id, session)

@router.post("/maquinarios", response_model=MaquinarioResponse, status_code=status.HTTP_201_CREATED)
async def criar_maquinario(
    maquinario_in: MaquinarioCreate,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Cadastra um novo maquinário na frota."""
    return await ManutencaoService.criar_maquinario(maquinario_in, propriedade_id, session)

@router.patch("/maquinarios/{id}/horimetro", response_model=MaquinarioResponse)
async def atualizar_horimetro(
    horas: Decimal = Query(..., gt=0),
    id: UUID = Path(...),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await ManutencaoService.atualizar_horimetro(id, horas, propriedade_id, session)

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

@router.post("/manutencao/ordens", response_model=OrdemManutencaoResponse, status_code=status.HTTP_201_CREATED)
async def criar_ordem_manutencao(
    ordem_in: OrdemManutencaoCreate,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Abre uma nova ordem de serviço/manutenção."""
    return await ManutencaoService.criar_ordem(ordem_in, propriedade_id, session)

@router.patch("/manutencao/ordens/{id}/concluir", response_model=OrdemManutencaoResponse)
async def concluir_ordem(
    custo_real: Decimal = Query(..., ge=0),
    id: UUID = Path(...),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await ManutencaoService.concluir_ordem(id, custo_real, propriedade_id, session)


# ─── Viabilidade & Modelagem Financeira ─────────────────────

@router.post("/viabilidade/calcular", response_model=ViabilidadeResponse)
async def calcular_viabilidade(
    request: ViabilidadeRequest,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    try:
        return await ViabilidadeService.calcular_viabilidade(request, propriedade_id, session)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
