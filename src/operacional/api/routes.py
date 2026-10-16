from decimal import Decimal
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.operacional.application.manutencao import ManutencaoService
from src.operacional.application.rastreabilidade import RastreabilidadeService
from src.operacional.application.talhoes import SafrasService, TalhoesService
from src.operacional.application.viabilidade import ViabilidadeService
from src.operacional.domain.schemas import (
    AlocacaoInsumoCreate,
    AlocacaoInsumoResponse,
    LoteInsumoCreate,
    LoteInsumoResponse,
    MaquinarioCreate,
    MaquinarioResponse,
    OrdemManutencaoCreate,
    OrdemManutencaoResponse,
    SafraCreate,
    SafraResponse,
    SafraUpdate,
    TalhaoCreate,
    TalhaoResponse,
    ViabilidadeRequest,
    ViabilidadeResponse,
)
from src.shared.api.dependencies import get_current_propriedade_id
from src.shared.database.session import get_session
from src.shared.export.export_engine import ExportEngine
from src.shared.utils.pagination import PaginatedResponse, PaginationParams, paginate

router = APIRouter(prefix="/operacional", tags=["Operacional"])


# ─── Talhões & GIS ───────────────────────────────────────────

@router.get("/talhoes", response_model=list[TalhaoResponse])
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


@router.get("/talhoes/resumo-gis")
async def obter_resumo_gis(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session),
):
    """Calcula estatísticas agregadas de cobertura geoespacial dos talhões da propriedade."""
    return await TalhoesService.obter_resumo_gis(propriedade_id, session)


@router.get("/talhoes/localizar-ponto", response_model=TalhaoResponse)
async def localizar_talhao_por_ponto(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Latitude do ponto em WGS84"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Longitude do ponto em WGS84"),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session),
):
    """Localiza o talhão que contém as coordenadas (Point-in-Polygon via GiST PostGIS)."""
    talhao = await TalhoesService.buscar_talhao_por_ponto(
        latitude, longitude, propriedade_id, session
    )
    if not talhao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum talhão encontrado para as coordenadas informadas na propriedade.",
        )
    return talhao


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

@router.get("/safras", response_model=list[SafraResponse])
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

@router.get("/insumos/lotes", response_model=list[LoteInsumoResponse])
async def listar_lotes_insumo(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Lista todos os lotes de insumos cadastrados na propriedade."""
    return await RastreabilidadeService.listar_lotes(propriedade_id, session)

@router.post(
    "/insumos/lotes",
    response_model=LoteInsumoResponse,
    status_code=status.HTTP_201_CREATED,
)
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

@router.get("/insumos/rastreabilidade/{talhao_id}", response_model=list[AlocacaoInsumoResponse])
async def consultar_rastreabilidade(
    talhao_id: UUID = Path(...),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await RastreabilidadeService.consultar_rastreabilidade_talhao(
        talhao_id, propriedade_id, session
    )

@router.get("/insumos/estoques-baixos", response_model=list[LoteInsumoResponse])
async def verificar_estoques_baixos(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    return await RastreabilidadeService.verificar_estoques_baixos(propriedade_id, session)

@router.get("/insumos/export/xlsx")
async def exportar_inventario_insumos_xlsx(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Exporta planilha formatada em Excel com o balanço de estoque e rastreabilidade de insumos."""
    xlsx_bytes = await ExportEngine.gerar_inventario_insumos_xlsx(propriedade_id, session)
    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="inventario_insumos_seed.xlsx"'}
    )


# ─── Maquinários & Frotas ───────────────────────────────────

@router.get("/maquinarios", response_model=list[MaquinarioResponse])
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


@router.get("/maquinarios/export/xlsx")
async def exportar_relatorio_maquinarios_xlsx(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session),
):
    """Exporta planilha formatada em Excel com a frota de maquinários e ordens de serviço."""
    xlsx_bytes = await ExportEngine.gerar_relatorio_maquinarios_xlsx(propriedade_id, session)
    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="frota_maquinarios_seed.xlsx"'},
    )


@router.get("/manutencao/ordens", response_model=PaginatedResponse[OrdemManutencaoResponse])
async def listar_ordens(
    status: str | None = None,
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


@router.post(
    "/manutencao/ordens",
    response_model=OrdemManutencaoResponse,
    status_code=status.HTTP_201_CREATED,
)
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
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.get("/viabilidade/export/xlsx")
async def exportar_dre_viabilidade_xlsx(
    safra_id: UUID | None = None,
    cultura: str = "Soja",
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session),
):
    """Exporta a Demonstração de Resultado do Exercício (DRE) em planilha Excel (.xlsx)."""
    from src.shared.database.models import Propriedade

    propriedade = await session.get(Propriedade, propriedade_id)
    viab_data: dict[str, Any] = {}
    if safra_id:
        try:
            req = ViabilidadeRequest(
                safra_id=safra_id,
                preco_mercado_saca=Decimal("138.40"),
                custo_mao_obra=Decimal("180000.00"),
                custo_frete=Decimal("95000.00"),
                custo_impostos=Decimal("60000.00"),
            )
            resp = await ViabilidadeService.calcular_viabilidade(req, propriedade_id, session)
            viab_data = resp.model_dump()
        except Exception:
            pass

    xlsx_bytes = ExportEngine.gerar_dre_viabilidade_xlsx(viab_data, propriedade, cultura=cultura)
    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="dre_viabilidade_seed.xlsx"'},
    )


@router.get("/viabilidade/export/pdf")
async def exportar_dre_viabilidade_pdf(
    safra_id: UUID | None = None,
    cultura: str = "Soja",
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session),
):
    """Exporta a Demonstração de Resultado do Exercício (DRE) em formato PDF oficial."""
    from src.shared.database.models import Propriedade

    propriedade = await session.get(Propriedade, propriedade_id)
    viab_data: dict[str, Any] = {}
    if safra_id:
        try:
            req = ViabilidadeRequest(
                safra_id=safra_id,
                preco_mercado_saca=Decimal("138.40"),
                custo_mao_obra=Decimal("180000.00"),
                custo_frete=Decimal("95000.00"),
                custo_impostos=Decimal("60000.00"),
            )
            resp = await ViabilidadeService.calcular_viabilidade(req, propriedade_id, session)
            viab_data = resp.model_dump()
        except Exception:
            pass

    pdf_bytes = ExportEngine.gerar_dre_viabilidade_pdf(viab_data, propriedade, cultura=cultura)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="dre_viabilidade_seed.pdf"'},
    )

