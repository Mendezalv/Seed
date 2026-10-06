from datetime import datetime, timedelta, timezone
from typing import Any
import uuid
from jose import jwt, JWTError
from pydantic import BaseModel
from src.shared.config import get_settings

settings = get_settings()

class TokenPayload(BaseModel):
    """
    Payload do Token JWT.
    """
    sub: uuid.UUID
    org: uuid.UUID
    role: str
    permissions: list[str]

def create_access_token(data: dict[str, Any]) -> str:
    """
    Cria um token de acesso JWT a partir dos dados informados.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> TokenPayload:
    """
    Decodifica e valida o token JWT retornando o payload mapeado.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return TokenPayload(**payload)
    except (JWTError, Exception) as e:
        raise ValueError("Token inválido ou expirado") from e
