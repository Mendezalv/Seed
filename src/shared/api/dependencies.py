"""
Dependências de API compartilhadas entre os módulos de rotas.

Faz re-export das dependências de autenticação com aliases
usados nos routers dos módulos de domínio.
"""

from src.shared.auth.dependencies import (
    get_current_user,
    get_current_tenant,
    oauth2_scheme,
)

# Alias utilizado nos routers — retorna o UUID do propriedade_id (tenant)
get_current_propriedade_id = get_current_tenant

__all__ = [
    "get_current_user",
    "get_current_tenant",
    "get_current_propriedade_id",
    "oauth2_scheme",
]
