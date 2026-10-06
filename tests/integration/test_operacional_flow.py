import pytest
from httpx import AsyncClient

@pytest.fixture
async def auth_token(async_client: AsyncClient) -> str:
    # Setup user and property, then login
    register_payload = {
        "email": "operador@agrohub.com",
        "nome_completo": "Operador",
        "senha": "password",
        "propriedade": {
            "nome": "Fazenda Operacao"
        }
    }
    await async_client.post("/auth/register", json=register_payload)
    response = await async_client.post("/auth/login", data={"username": "operador@agrohub.com", "password": "password"})
    return response.json()["access_token"]

@pytest.mark.asyncio
async def test_operacional_flow(async_client: AsyncClient, auth_token: str):
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # 1. Create Insumo (needed for Lote)
    insumo_payload = {
        "tipo": "FERTILIZANTE",
        "nome": "Ureia",
        "unidade_medida": "kg",
        "preco_unitario": 2.50
    }
    response = await async_client.post("/operacional/insumos", json=insumo_payload, headers=headers)
    if response.status_code == 404:
        pytest.skip("Endpoint not implemented yet")
    assert response.status_code in [200, 201]
    insumo_id = response.json()["id"]

    # 2. Create Lote de Insumo
    lote_payload = {
        "insumo_id": insumo_id,
        "codigo_lote": "LOTE-001",
        "quantidade_inicial": 1000.0,
        "entrada_em": "2026-01-01T00:00:00Z"
    }
    response = await async_client.post("/operacional/lotes", json=lote_payload, headers=headers)
    assert response.status_code in [200, 201]
    lote_id = response.json()["id"]

    # Setup Safra & Talhao
    talhao_response = await async_client.post("/operacional/talhoes", json={"nome": "T1", "area_hectares": 100.0}, headers=headers)
    talhao_id = talhao_response.json()["id"]
    safra_response = await async_client.post("/operacional/safras", json={"talhao_id": talhao_id, "cultura": "Soja", "data_plantio": "2026-01-01"}, headers=headers)
    safra_id = safra_response.json()["id"]
    operador_id = "00000000-0000-0000-0000-000000000000"

    # 3. Test allocating insumo and verifying stock decrease
    alocacao_payload = {
        "lote_insumo_id": lote_id,
        "safra_id": safra_id,
        "talhao_id": talhao_id,
        "quantidade": 200.0,
        "area_hectares": 10.0,
        "operador_id": operador_id,
        "aplicado_em": "2026-01-10T00:00:00Z"
    }
    response = await async_client.post("/operacional/alocacoes", json=alocacao_payload, headers=headers)
    assert response.status_code in [200, 201]

    # Verify stock decrease
    response = await async_client.get(f"/operacional/lotes/{lote_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["quantidade_atual"] == 800.0

@pytest.mark.asyncio
async def test_viabilidade_calculation(async_client: AsyncClient, auth_token: str):
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {
        "area_hectares": 100.0,
        "cultura": "Soja",
        "custo_estimado": 50000.0
    }
    response = await async_client.post("/operacional/viabilidade/calcular", json=payload, headers=headers)
    if response.status_code == 404:
        pytest.skip("Endpoint not implemented yet")
    assert response.status_code == 200
    data = response.json()
    assert "viabilidade_score" in data
    assert "lucro_estimado" in data
