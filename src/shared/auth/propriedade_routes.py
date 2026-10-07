from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update

from src.shared.database.session import get_session
from src.shared.database.models import Propriedade
from src.shared.auth.schemas import (
    PropriedadeCreate, PropriedadeResponse, PropriedadeUpdate,
    UsuarioResponse, UsuarioCreate, MembroCreate, MembroUpdate
)
from src.shared.auth.services import AuthService
from src.shared.auth.dependencies import get_current_user
from src.shared.auth.rbac import require_permission
from src.shared.api.dependencies import get_current_propriedade_id

# Importar modelos para o dashboard
from src.operacional.domain.models import Talhao, Safra, Maquinario, OrdemManutencao
from src.epidemiologico.domain.models import AlertaEpidemiologico
from src.energetico.domain.models import RelatorioESG

router = APIRouter(prefix="/propriedades", tags=["Propriedades"])

@router.post("", response_model=PropriedadeResponse, status_code=status.HTTP_201_CREATED)
async def criar_propriedade(
    prop_in: PropriedadeCreate,
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Cria uma nova propriedade."""
    nova_propriedade = Propriedade(**prop_in.model_dump())
    session.add(nova_propriedade)
    await session.commit()
    await session.refresh(nova_propriedade)
    
    from src.shared.database.seed_data import seed_fontes_energia
    await seed_fontes_energia(session, nova_propriedade.id)
    
    return PropriedadeResponse.model_validate(nova_propriedade)

@router.get("/minha", response_model=PropriedadeResponse)
async def obter_minha_propriedade(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Obtém a propriedade do usuário logado."""
    propriedade = await session.get(Propriedade, propriedade_id)
    if not propriedade:
        raise HTTPException(status_code=404, detail="Propriedade não encontrada")
    return PropriedadeResponse.model_validate(propriedade)

@router.patch("/minha", response_model=PropriedadeResponse, dependencies=[Depends(require_permission("config:property"))])
async def atualizar_minha_propriedade(
    prop_in: PropriedadeUpdate,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Atualiza a propriedade do usuário logado."""
    propriedade = await session.get(Propriedade, propriedade_id)
    if not propriedade:
        raise HTTPException(status_code=404, detail="Propriedade não encontrada")
        
    update_data = prop_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(propriedade, key, value)
        
    await session.commit()
    await session.refresh(propriedade)
    return PropriedadeResponse.model_validate(propriedade)

@router.get("/minha/dashboard")
async def obter_dashboard(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Obtém estatísticas resumidas da propriedade."""
    # Count talhoes
    talhoes_count = await session.scalar(select(func.count()).select_from(Talhao).where(Talhao.propriedade_id == propriedade_id))
    
    # Count safras
    safras_count = await session.scalar(select(func.count()).select_from(Safra).where(Safra.propriedade_id == propriedade_id))
    
    # Count maquinarios
    maquinas_count = await session.scalar(select(func.count()).select_from(Maquinario).where(Maquinario.propriedade_id == propriedade_id))
    
    # Count alertas ativos
    alertas_count = await session.scalar(
        select(func.count()).select_from(AlertaEpidemiologico)
        .where(AlertaEpidemiologico.propriedade_id == propriedade_id)
    )

    # Count ordens de manutencao pendentes
    ordens_count = await session.scalar(
        select(func.count()).select_from(OrdemManutencao)
        .where(
            OrdemManutencao.propriedade_id == propriedade_id,
            OrdemManutencao.status == "PENDENTE",
        )
    )

    # Count relatorios ESG
    relatorios_count = await session.scalar(
        select(func.count()).select_from(RelatorioESG)
        .where(RelatorioESG.propriedade_id == propriedade_id)
    )

    return {
        "talhoes": talhoes_count or 0,
        "safras": safras_count or 0,
        "maquinarios": maquinas_count or 0,
        "ordens_manutencao_pendentes": ordens_count or 0,
        "alertas_epidemiologicos": alertas_count or 0,
        "relatorios_esg": relatorios_count or 0,
    }

@router.get("/minha/membros", response_model=list[UsuarioResponse], dependencies=[Depends(require_permission("read:dashboard"))])
async def listar_membros(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Lista todos os membros cadastrados na propriedade do usuário."""
    usuarios = await AuthService.listar_usuarios(propriedade_id, session)
    return [UsuarioResponse.model_validate(u) for u in usuarios]

@router.post("/minha/membros", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("admin:users"))])
async def adicionar_membro(
    membro_in: MembroCreate,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Adiciona um novo membro à equipe da propriedade (apenas administradores)."""
    usuario_create = UsuarioCreate(
        email=membro_in.email,
        nome_completo=membro_in.nome_completo,
        senha=membro_in.senha,
        role=membro_in.role,
        propriedade_id=propriedade_id
    )
    return await AuthService.registrar_usuario(usuario_create, session)

@router.patch("/minha/membros/{user_id}", response_model=UsuarioResponse, dependencies=[Depends(require_permission("admin:users"))])
async def atualizar_membro(
    user_id: UUID,
    membro_in: MembroUpdate,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Atualiza dados, papel ou status de um membro da propriedade."""
    dados = membro_in.model_dump(exclude_unset=True)
    usuario = await AuthService.atualizar_usuario(user_id, dados, propriedade_id, session)
    return UsuarioResponse.model_validate(usuario)

@router.delete("/minha/membros/{user_id}", response_model=UsuarioResponse, dependencies=[Depends(require_permission("admin:users"))])
async def desativar_membro(
    user_id: UUID,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Desativa o acesso de um membro da propriedade."""
    usuario = await AuthService.desativar_usuario(user_id, propriedade_id, session)
    return UsuarioResponse.model_validate(usuario)
