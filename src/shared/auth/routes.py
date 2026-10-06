from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.database.session import get_session
from src.shared.auth.schemas import UsuarioCreate, UsuarioResponse, LoginRequest, LoginResponse
from src.shared.auth.services import AuthService
from src.shared.auth.dependencies import get_current_user
from src.shared.auth.rbac import require_permission
from src.shared.api.dependencies import get_current_propriedade_id

router = APIRouter(prefix="/auth", tags=["Autenticacao"])

@router.post("/registro", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def registrar_usuario(
    usuario_in: UsuarioCreate, 
    session: AsyncSession = Depends(get_session)
):
    """Registra um novo usuário."""
    return await AuthService.registrar_usuario(usuario_in, session)

@router.post("/login", response_model=LoginResponse)
async def login(
    login_in: LoginRequest,
    session: AsyncSession = Depends(get_session)
):
    """Autentica usuário e retorna token JWT."""
    return await AuthService.autenticar(login_in, session)

@router.get("/me", response_model=UsuarioResponse)
async def obter_usuario_logado(
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Obtém dados do usuário atual logado."""
    return await AuthService.obter_usuario(UUID(current_user.sub), session)

@router.get("/usuarios", response_model=list[UsuarioResponse], dependencies=[Depends(require_permission("admin:users"))])
async def listar_usuarios(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Lista usuários da propriedade."""
    return await AuthService.listar_usuarios(propriedade_id, session)

@router.patch("/usuarios/{user_id}/desativar", response_model=UsuarioResponse, dependencies=[Depends(require_permission("admin:users"))])
async def desativar_usuario(
    user_id: UUID,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session)
):
    """Desativa um usuário na propriedade."""
    return await AuthService.desativar_usuario(user_id, propriedade_id, session)
