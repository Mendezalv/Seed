"""
Serviço Unificado de Telemetria Climática com Caching em Redis (INMET & CPTEC).
"""

import math
from datetime import UTC, datetime, timedelta
from typing import Any

from src.shared.cache import cache_manager
from src.shared.integrations.clima.cptec import CPTECClient, PrevisaoCPTEC
from src.shared.integrations.clima.inmet import DadosMeteorologicos, EstacaoINMET, INMETClient


def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcula a distância geodésica em km entre duas coordenadas geográficas."""
    r = 6371.0  # Raio da Terra em km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


class ClimaService:
    """Fachada de alta performance com caching em Redis para serviços meteorológicos."""

    def __init__(self) -> None:
        self.inmet = INMETClient()
        self.cptec = CPTECClient()

    async def listar_todas_estacoes(self) -> list[EstacaoINMET]:
        """Retorna todas as estações INMET com cache de 24h."""
        cache_key = "clima:inmet:estacoes_catalogo"
        cached = await cache_manager.get_json(cache_key)
        if cached:
            return [EstacaoINMET(**item) for item in cached]

        estacoes = await self.inmet.listar_estacoes()
        if estacoes:
            await cache_manager.set_json(
                cache_key,
                [e.model_dump() for e in estacoes],
                ttl=86400,
            )
        return estacoes

    async def encontrar_estacao_mais_proxima(
        self,
        latitude: float,
        longitude: float,
        max_km: float = 250.0,
    ) -> tuple[EstacaoINMET | None, float | None]:
        """Localiza a estação meteorológica oficial mais próxima das coordenadas da fazenda."""
        cache_key = f"clima:nearest:{round(latitude, 3)}:{round(longitude, 3)}"
        cached = await cache_manager.get_json(cache_key)
        if cached and "estacao" in cached:
            return EstacaoINMET(**cached["estacao"]), cached.get("distancia_km")

        estacoes = await self.listar_todas_estacoes()
        if not estacoes:
            return None, None

        mais_proxima: EstacaoINMET | None = None
        menor_distancia = float("inf")

        for estacao in estacoes:
            dist = _haversine_distance(latitude, longitude, estacao.latitude, estacao.longitude)
            if dist < menor_distancia and dist <= max_km:
                menor_distancia = dist
                mais_proxima = estacao

        if mais_proxima:
            dist_km = round(menor_distancia, 2)
            await cache_manager.set_json(
                cache_key,
                {"estacao": mais_proxima.model_dump(), "distancia_km": dist_km},
                ttl=86400,
            )
            return mais_proxima, dist_km

        return None, None

    async def obter_historico_recente(
        self,
        codigo_estacao: str,
        dias: int = 7,
    ) -> list[DadosMeteorologicos]:
        """Obtém dados meteorológicos recentes com cache horário (3600s)."""
        data_fim = datetime.now(UTC).date()
        data_inicio = data_fim - timedelta(days=dias)
        return await self.inmet.obter_dados_estacao(codigo_estacao, data_inicio, data_fim)

    async def obter_previsao_municipio(self, nome_cidade: str) -> PrevisaoCPTEC | None:
        """Busca cidade no CPTEC e retorna a previsão de 7 dias com cache de 3 horas."""
        cache_key = f"clima:cptec:previsao:{nome_cidade.lower().strip()}"
        cached = await cache_manager.get_json(cache_key)
        if cached:
            return PrevisaoCPTEC(**cached)

        cidades = await self.cptec.buscar_cidade(nome_cidade)
        if not cidades:
            return None

        cidade_id = cidades[0].id
        previsao = await self.cptec.previsao_7dias(cidade_id)
        if previsao:
            await cache_manager.set_json(cache_key, previsao.model_dump(mode="json"), ttl=10800)

        return previsao

    async def invalidar_cache_clima(self) -> int:
        """Limpa todo o cache climático armazenado em Redis/memória."""
        return await cache_manager.delete_pattern("clima:*")

    async def obter_estatisticas_cache(self) -> dict[str, Any]:
        """Retorna o estado operacional e métricas de acerto do cache climático."""
        return await cache_manager.get_stats()


# Instância singleton global do serviço climático
clima_service = ClimaService()
