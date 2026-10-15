"""
Testes unitários para o gerenciador de cache Redis com fallback em memória
e o serviço de telemetria climática cached da Plataforma Seed.
"""

import time
from unittest.mock import AsyncMock, patch

import pytest

from src.shared.cache.redis_client import RedisCacheManager
from src.shared.integrations.clima.inmet import EstacaoINMET
from src.shared.integrations.clima.service import ClimaService, _haversine_distance


@pytest.mark.asyncio
async def test_cache_memory_fallback_get_set():
    cache = RedisCacheManager(redis_url="redis://invalid-host-for-tests:9999/0")

    # Set e Get
    assert await cache.set("seed:teste:1", "valor_teste", ttl=60) is True
    val = await cache.get("seed:teste:1")
    assert val == "valor_teste"

    # Chave inexistente (miss)
    miss = await cache.get("seed:teste:inexistente")
    assert miss is None


@pytest.mark.asyncio
async def test_cache_memory_fallback_json():
    cache = RedisCacheManager(redis_url="redis://invalid-host-for-tests:9999/0")

    payload = {
        "talhao": "Talhão Sul",
        "area_hectares": 150.5,
        "culturas": ["Soja", "Milho"],
        "ativo": True,
    }
    assert await cache.set_json("seed:talhao:payload", payload, ttl=60) is True
    recuperado = await cache.get_json("seed:talhao:payload")
    assert recuperado == payload
    assert recuperado["area_hectares"] == 150.5


@pytest.mark.asyncio
async def test_cache_memory_ttl_expiration():
    cache = RedisCacheManager(redis_url="redis://invalid-host-for-tests:9999/0")

    # Armazena chave no cache
    await cache.set("seed:expiravel", "dados_temporarios", ttl=60)
    assert await cache.get("seed:expiravel") == "dados_temporarios"

    # Simula passagem de tempo no cache em memória
    cache._memory_cache["seed:expiravel"] = ("dados_temporarios", time.time() - 1.0)
    expirado = await cache.get("seed:expiravel")
    assert expirado is None


@pytest.mark.asyncio
async def test_cache_delete_and_delete_pattern():
    cache = RedisCacheManager(redis_url="redis://invalid-host-for-tests:9999/0")

    await cache.set("clima:estacao:A001", "Dados Estação 1", ttl=60)
    await cache.set("clima:estacao:A002", "Dados Estação 2", ttl=60)
    await cache.set("operacional:talhao:10", "Talhão 10", ttl=60)

    # Deleta chave individual
    assert await cache.delete("clima:estacao:A001") is True
    assert await cache.get("clima:estacao:A001") is None

    # Deleta por padrão wildcard
    removidos = await cache.delete_pattern("clima:*")
    assert removidos == 1
    assert await cache.get("clima:estacao:A002") is None
    # Outro namespace não afetado
    assert await cache.get("operacional:talhao:10") == "Talhão 10"


@pytest.mark.asyncio
async def test_cache_stats_metrics():
    cache = RedisCacheManager(redis_url="redis://invalid-host-for-tests:9999/0")

    await cache.set("metrica:chave", "100", ttl=60)
    await cache.get("metrica:chave")  # Hit 1
    await cache.get("metrica:chave")  # Hit 2
    await cache.get("metrica:inexistente")  # Miss 1

    stats = await cache.get_stats()
    assert stats["hits"] == 2
    assert stats["misses"] == 1
    assert stats["total_requests"] == 3
    assert stats["hit_ratio_percent"] == 66.67
    assert stats["backend"] in ["memory_fallback", "redis"]


def test_haversine_distance():
    # Distância Brasília (-15.79, -47.89) -> Goiânia (-16.68, -49.26) ~ 170-180 km
    dist = _haversine_distance(-15.7975, -47.8919, -16.6869, -49.2648)
    assert 165.0 <= dist <= 185.0

    # Distância ponto para si mesmo é 0
    assert _haversine_distance(-15.0, -47.0, -15.0, -47.0) == 0.0


@pytest.mark.asyncio
async def test_clima_service_encontrar_estacao_mais_proxima():
    service = ClimaService()

    estacoes_mock = [
        EstacaoINMET(
            codigo="A001",
            nome="Estação Brasília",
            estado="DF",
            latitude=-15.7893,
            longitude=-47.9258,
        ),
        EstacaoINMET(
            codigo="A002",
            nome="Estação Goiânia",
            estado="GO",
            latitude=-16.6428,
            longitude=-49.2217,
        ),
    ]

    with patch.object(service, "listar_todas_estacoes", AsyncMock(return_value=estacoes_mock)):
        # Ponto muito próximo de Brasília
        estacao, dist_km = await service.encontrar_estacao_mais_proxima(
            latitude=-15.80, longitude=-47.90
        )
        assert estacao is not None
        assert estacao.codigo == "A001"
        assert dist_km < 10.0

        # Ponto fora do raio máximo (ex: Tóquio)
        fora, dist_fora = await service.encontrar_estacao_mais_proxima(
            latitude=35.6762, longitude=139.6503, max_km=100.0
        )
        assert fora is None
        assert dist_fora is None
