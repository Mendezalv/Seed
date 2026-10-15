"""
Testes de integração para os endpoints geoespaciais (GIS / GiST PostGIS)
e a camada de telemetria climática com cache Redis.
"""

from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from src.shared.integrations.clima.inmet import EstacaoINMET


@pytest.fixture
async def auth_token(async_client: AsyncClient) -> str:
    register_payload = {
        "email": "gis_operator@seed.agro",
        "nome_completo": "Operador GIS Seed",
        "senha": "SenhaForte123!",
        "role": "GESTOR",
    }
    await async_client.post("/api/v1/auth/registro", json=register_payload)
    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "gis_operator@seed.agro", "senha": "SenhaForte123!"},
    )
    return response.json()["access_token"]


@pytest.mark.asyncio
async def test_gis_talhoes_resumo_e_localizacao(async_client: AsyncClient, auth_token: str):
    headers = {"Authorization": f"Bearer {auth_token}"}

    # 1. Cadastra dois talhões para o tenant
    talhao_1 = {
        "nome": "Talhão GIS Alpha",
        "area_hectares": 150.0,
        "cultura_atual": "Soja",
        "status": "ATIVO",
    }
    talhao_2 = {
        "nome": "Talhão GIS Beta",
        "area_hectares": 200.0,
        "cultura_atual": "Milho",
        "status": "ATIVO",
    }
    resp1 = await async_client.post("/api/v1/operacional/talhoes", json=talhao_1, headers=headers)
    assert resp1.status_code in [200, 201]

    resp2 = await async_client.post("/api/v1/operacional/talhoes", json=talhao_2, headers=headers)
    assert resp2.status_code in [200, 201]

    # 2. Testa endpoint de Resumo GIS
    resumo_resp = await async_client.get("/api/v1/operacional/talhoes/resumo-gis", headers=headers)
    assert resumo_resp.status_code == 200
    resumo = resumo_resp.json()
    assert resumo["total_talhoes"] >= 2
    assert resumo["area_total_hectares"] >= 350.0
    assert "Soja" in resumo["distribuicao_culturas"]
    assert "Milho" in resumo["distribuicao_culturas"]

    # 3. Testa localização de ponto geográfico (Point-in-Polygon via GiST)
    loc_resp = await async_client.get(
        "/api/v1/operacional/talhoes/localizar-ponto?latitude=-15.789&longitude=-47.925",
        headers=headers,
    )
    assert loc_resp.status_code == 200
    talhao_encontrado = loc_resp.json()
    assert "id" in talhao_encontrado
    assert talhao_encontrado["nome"] in ["Talhão GIS Alpha", "Talhão GIS Beta"]


@pytest.mark.asyncio
async def test_clima_cache_endpoints(async_client: AsyncClient, auth_token: str):
    headers = {"Authorization": f"Bearer {auth_token}"}

    # 1. Estatísticas de Cache Redis
    stats_resp = await async_client.get("/api/v1/epidemiologico/clima/cache-stats", headers=headers)
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert "hits" in stats
    assert "misses" in stats
    assert "backend" in stats

    # 2. Invalidação de Cache
    del_resp = await async_client.delete("/api/v1/epidemiologico/clima/cache", headers=headers)
    assert del_resp.status_code == 200
    del_data = del_resp.json()
    assert del_data["status"] == "ok"
    assert "chaves_invalidadas" in del_data

    # 3. Busca de Estação Meteorológica Mais Próxima com Mock
    mock_estacao = EstacaoINMET(
        codigo="A801",
        nome="Estação Agro Meteorológica Central",
        estado="SP",
        latitude=-22.0,
        longitude=-47.0,
    )

    with patch(
        "src.epidemiologico.api.routes.clima_service.encontrar_estacao_mais_proxima",
        AsyncMock(return_value=(mock_estacao, 12.45)),
    ):
        estacao_resp = await async_client.get(
            "/api/v1/epidemiologico/clima/estacao-proxima?latitude=-22.05&longitude=-47.02",
            headers=headers,
        )
        assert estacao_resp.status_code == 200
        data = estacao_resp.json()
        assert data["encontrada"] is True
        assert data["estacao"]["codigo"] == "A801"
        assert data["distancia_km"] == 12.45
