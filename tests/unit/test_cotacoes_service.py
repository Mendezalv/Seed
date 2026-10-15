"""
Testes unitários para o Serviço de Cotações de Commodities e Moedas em Tempo Real.
"""

from unittest.mock import AsyncMock, patch
import pytest

from src.shared.integrations.cotacoes.service import CotacoesService, CACHE_KEY_COTACOES


@pytest.fixture
def service():
    return CotacoesService()


@pytest.mark.asyncio
async def test_obter_cotacoes_em_tempo_real_inicial(service):
    """Verifica que o catálogo inicial de commodities é montado com todos os dados esperados."""
    with patch("src.shared.integrations.cotacoes.service.cache_manager.get_json", new_callable=AsyncMock) as mock_get, \
         patch("src.shared.integrations.cotacoes.service.cache_manager.set_json", new_callable=AsyncMock) as mock_set:
        mock_get.return_value = None

        cotacoes = await service.obter_cotacoes_em_tempo_real(forcar_atualizacao=True)

        assert isinstance(cotacoes, list)
        assert len(cotacoes) == 5

        codigos = [item["codigo"] for item in cotacoes]
        assert "SOJA" in codigos
        assert "MILHO" in codigos
        assert "BOI" in codigos
        assert "CAFE" in codigos
        assert "DOLAR" in codigos

        for item in cotacoes:
            assert item["preco"] > 0
            assert "variacao_pct" in item
            assert item["tendencia"] in ["UP", "DOWN", "EQUAL"]
            assert "unidade" in item
            assert "mercado" in item

        mock_set.assert_awaited_once()
        assert mock_set.await_args[0][0] == CACHE_KEY_COTACOES


@pytest.mark.asyncio
async def test_obter_cotacoes_do_cache(service):
    """Verifica retorno direto do cache quando dados válidos já existem no Redis."""
    fake_cached = [
        {"codigo": "SOJA", "nome": "Soja", "preco": 140.0, "variacao_pct": 1.5, "tendencia": "UP", "unidade": "R$/sc"}
    ]
    with patch("src.shared.integrations.cotacoes.service.cache_manager.get_json", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = fake_cached

        cotacoes = await service.obter_cotacoes_em_tempo_real(forcar_atualizacao=False)

        assert cotacoes == fake_cached
        mock_get.assert_awaited_once_with(CACHE_KEY_COTACOES)


@pytest.mark.asyncio
async def test_simular_flutuacao_mercado(service):
    """Verifica que a simulação de pregão atualiza preços e transmite via WebSocket broadcast_all."""
    initial_data = [
        {
            "codigo": "SOJA",
            "nome": "Soja Paranaguá",
            "unidade": "R$/sc",
            "mercado": "CEPEA",
            "preco": 138.0,
            "preco_anterior": 138.0,
            "variacao_pct": 0.0,
            "minima_dia": 137.0,
            "maxima_dia": 139.0,
            "volume_contratos": 5000,
        }
    ]

    with patch.object(service, "obter_cotacoes_em_tempo_real", new_callable=AsyncMock) as mock_obter, \
         patch("src.shared.integrations.cotacoes.service.cache_manager.set_json", new_callable=AsyncMock) as mock_set, \
         patch("src.shared.integrations.cotacoes.service.ws_manager.broadcast_all", new_callable=AsyncMock) as mock_ws:
        mock_obter.return_value = initial_data
        mock_ws.return_value = 2

        novas = await service.simular_flutuacao_mercado(volatilidade=0.02)

        assert len(novas) == 1
        assert "preco" in novas[0]
        assert "atualizado_em" in novas[0]

        mock_set.assert_awaited_once()
        mock_ws.assert_awaited_once()
        ws_payload = mock_ws.await_args[0][0]
        assert ws_payload["type"] == "COTACOES_UPDATE"
        assert ws_payload["data"] == novas


@pytest.mark.asyncio
async def test_obter_historico_commodity(service):
    """Verifica que o histórico gera série temporal com pontos diários."""
    with patch("src.shared.integrations.cotacoes.service.cache_manager.get_json", new_callable=AsyncMock) as mock_get, \
         patch("src.shared.integrations.cotacoes.service.cache_manager.set_json", new_callable=AsyncMock) as mock_set:
        mock_get.return_value = None

        historico = await service.obter_historico(commodity_codigo="SOJA", dias=5)

        assert len(historico) == 5
        for ponto in historico:
            assert "data" in ponto
            assert "preco" in ponto
            assert "variacao_pct" in ponto
            assert "volume" in ponto

        mock_set.assert_awaited_once()
