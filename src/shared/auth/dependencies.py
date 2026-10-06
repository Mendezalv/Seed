from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import uuid
from src.shared.auth.jwt import TokenPayload, decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenPayload:
    """
    Extrai e valida o Token JWT retornado como um TokenPayload.
    """
    try:
        return decode_token(token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_tenant(user: TokenPayload = Depends(get_current_user)) -> uuid.UUID:
    """
    Retorna o ID da propriedade (tenant) a partir do usuário autenticado.
    """
    return user.org
