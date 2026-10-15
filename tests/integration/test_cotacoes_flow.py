"""
Testes de integração para as rotas de Cotações em Tempo Real e Simulação de Mercado.
"""

from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from src.main import app


@pytest.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.mark.asyncio
async def test_listar_cotacoes_flow(async_client):
    """Testa listagem de cotações em tempo real."""
    response = await async_client.get("/api/v1/cotacoes/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    codigos = [c["codigo"] for c in data]
    assert "SOJA" in codigos
    assert "MILHO" in codigos


@pytest.mark.asyncio
async def test_simular_pregao_flow(async_client):
    """Testa disparo de simulação de flutuação de pregão."""
    with patch("src.shared.integrations.cotacoes.service.ws_manager.broadcast_all", new_callable=AsyncMock) as mock_ws:
        mock_ws.return_value = 1

        response = await async_client.post("/api/v1/cotacoes/simular?volatilidade=0.01")
        assert response.status_code == 200
        payload = response.json()
        assert payload["status"] == "success"
        assert "cotacoes" in payload
        assert len(payload["cotacoes"]) >= 5


@pytest.mark.asyncio
async def test_obter_historico_commodity_flow(async_client):
    """Testa recuperação de série histórica da commodity."""
    response = await async_client.get("/api/v1/cotacoes/historico/MILHO?dias=5")
    assert response.status_code == 200
    data = response.json()
    assert data["codigo"] == "MILHO"
    assert data["dias"] == 5
    assert len(data["pontos"]) == 5


@pytest.mark.asyncio
async def test_obter_resumo_ticker_flow(async_client):
    """Testa endpoint condensado para o ticker executivo da Topbar."""
    response = await async_client.get("/api/v1/cotacoes/resumo-executivo")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    for item in data:
        assert "codigo" in item
        assert "preco" in item
        assert "variacao_pct" in item
        assert "tendencia" in item
