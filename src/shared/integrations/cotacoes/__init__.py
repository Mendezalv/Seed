"""
Integrações para obtenção de cotações de commodities e taxas (CEPEA, BCB).
"""

from src.shared.integrations.cotacoes.routes import router as cotacoes_router
from src.shared.integrations.cotacoes.service import CotacoesService, cotacoes_service

__all__ = ["cotacoes_router", "cotacoes_service", "CotacoesService"]
