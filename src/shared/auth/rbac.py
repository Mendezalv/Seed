from enum import Enum
from fastapi import HTTPException, status, Depends
from src.shared.auth.jwt import TokenPayload
from src.shared.auth.dependencies import get_current_user

class Role(str, Enum):
    """
    Papéis de usuário no sistema.
    """
    OPERADOR = "OPERADOR"
    GESTOR = "GESTOR"
    ADMIN = "ADMIN"
    CONSULTOR = "CONSULTOR"

ROLE_PERMISSIONS: dict[Role, list[str]] = {
    Role.OPERADOR: [
        "read:dashboard",
        "create:data"
    ],
    Role.CONSULTOR: [
        "read:dashboard",
        "read:reports"
    ],
    Role.GESTOR: [
        "read:dashboard",
        "create:data",
        "approve:maintenance",
        "read:reports",
        "create:reports",
        "config:property"
    ],
    Role.ADMIN: [
        "read:dashboard",
        "create:data",
        "approve:maintenance",
        "config:property",
        "admin:users",
        "read:reports",
        "create:reports"
    ]
}

def require_permission(permission: str):
    """
    Dependência do FastAPI que verifica se o usuário possui a permissão.
    """
    async def permission_checker(user: TokenPayload = Depends(get_current_user)):
        if permission not in user.permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permissão negada. Requer a permissão: {permission}"
            )
        return user
    return permission_checker

def require_role(min_role: Role):
    """
    Dependência do FastAPI que verifica se o usuário possui o papel específico.
    """
    async def role_checker(user: TokenPayload = Depends(get_current_user)):
        if user.role != min_role.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Papel inválido. Requer o papel: {min_role.value}"
            )
        return user
    return role_checker
