from uuid import UUID
from datetime import datetime, timezone
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from fastapi import HTTPException, status

from src.shared.database.models import Propriedade, Usuario
from src.shared.auth.schemas import UsuarioCreate, UsuarioResponse, LoginRequest, LoginResponse
from src.shared.auth.jwt import create_access_token
from src.shared.auth.rbac import ROLE_PERMISSIONS, Role

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

class AuthService:
    @staticmethod
    async def registrar_usuario(usuario_in: UsuarioCreate, session: AsyncSession) -> UsuarioResponse:
        query = select(Usuario).where(Usuario.email == usuario_in.email)
        result = await session.execute(query)
        if result.scalar_one_or_none() is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já cadastrado")

        prop_id = usuario_in.propriedade_id
        if not prop_id:
            nova_propriedade = Propriedade(nome=usuario_in.nome_completo)
            session.add(nova_propriedade)
            await session.flush()
            prop_id = nova_propriedade.id
            
            # Popula fontes de energia padrão para a nova propriedade
            from src.shared.database.seed_data import seed_fontes_energia
            await seed_fontes_energia(session, prop_id)
        
        novo_usuario = Usuario(
            email=usuario_in.email,
            nome_completo=usuario_in.nome_completo,
            senha_hash=pwd_context.hash(usuario_in.senha),
            propriedade_id=prop_id,
            role=usuario_in.role
        )
        session.add(novo_usuario)
        await session.commit()
        await session.refresh(novo_usuario)
        
        return UsuarioResponse.model_validate(novo_usuario)

    @staticmethod
    async def autenticar(login: LoginRequest, session: AsyncSession) -> LoginResponse:
        query = select(Usuario).where(Usuario.email == login.email)
        result = await session.execute(query)
        usuario = result.scalar_one_or_none()
        
        if not usuario or not pwd_context.verify(login.senha, usuario.senha_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")
            
        if not usuario.ativo:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuário inativo")
            
        usuario.ultimo_login = datetime.now(timezone.utc)
        await session.commit()
        await session.refresh(usuario)
        
        permissions = ROLE_PERMISSIONS.get(Role(usuario.role), [])
        token_data = {
            "sub": str(usuario.id),
            "org": str(usuario.propriedade_id),
            "role": usuario.role,
            "permissions": permissions
        }
        
        access_token = create_access_token(token_data)
        
        return LoginResponse(
            access_token=access_token,
            usuario=UsuarioResponse.model_validate(usuario)
        )

    @staticmethod
    async def obter_usuario(user_id: UUID, session: AsyncSession) -> Usuario:
        usuario = await session.get(Usuario, user_id)
        if not usuario:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
        return usuario

    @staticmethod
    async def listar_usuarios(propriedade_id: UUID, session: AsyncSession) -> list[Usuario]:
        query = select(Usuario).where(Usuario.propriedade_id == propriedade_id)
        result = await session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def atualizar_usuario(user_id: UUID, data: dict, propriedade_id: UUID, session: AsyncSession) -> Usuario:
        query = select(Usuario).where(Usuario.id == user_id, Usuario.propriedade_id == propriedade_id)
        result = await session.execute(query)
        usuario = result.scalar_one_or_none()
        
        if not usuario:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado nesta propriedade")
            
        if "senha" in data:
            data["senha_hash"] = pwd_context.hash(data.pop("senha"))
            
        for key, value in data.items():
            if hasattr(usuario, key):
                setattr(usuario, key, value)
                
        await session.commit()
        await session.refresh(usuario)
        return usuario

    @staticmethod
    async def desativar_usuario(user_id: UUID, propriedade_id: UUID, session: AsyncSession) -> Usuario:
        query = select(Usuario).where(Usuario.id == user_id, Usuario.propriedade_id == propriedade_id)
        result = await session.execute(query)
        usuario = result.scalar_one_or_none()
        
        if not usuario:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado nesta propriedade")
            
        usuario.ativo = False
        await session.commit()
        await session.refresh(usuario)
        return usuario
