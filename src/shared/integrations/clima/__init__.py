"""
Integrações com serviços meteorológicos (INMET, CPTEC) com caching de alto desempenho em Redis.
"""

from src.shared.integrations.clima.cptec import CPTECClient
from src.shared.integrations.clima.inmet import INMETClient
from src.shared.integrations.clima.service import ClimaService, clima_service

__all__ = ["INMETClient", "CPTECClient", "ClimaService", "clima_service"]
