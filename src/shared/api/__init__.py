"""
Re-exporta dependências de autenticação usadas pelas rotas da API.
Centraliza o acesso às dependências para evitar imports profundos nos routers.
"""

from src.shared.auth.dependencies import get_current_user, get_current_tenant, oauth2_scheme

# Alias usado pelas rotas — retorna o propriedade_id (UUID) do tenant atual
get_current_propriedade_id = get_current_tenant

__all__ = [
    "get_current_user",
    "get_current_tenant",
    "get_current_propriedade_id",
    "oauth2_scheme",
]
