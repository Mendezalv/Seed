import pytest
from httpx import AsyncClient

@pytest.fixture
async def auth_token(async_client: AsyncClient) -> str:
    register_payload = {
        "email": "operador@seed.agro",
        "nome_completo": "Operador Seed",
        "senha": "SenhaForte123!",
        "role": "GESTOR"
    }
    await async_client.post("/api/v1/auth/registro", json=register_payload)
    response = await async_client.post("/api/v1/auth/login", json={"email": "operador@seed.agro", "senha": "SenhaForte123!"})
    return response.json()["access_token"]

@pytest.mark.asyncio
async def test_operacional_flow(async_client: AsyncClient, auth_token: str):
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # 1. Registrar Entrada de Lote de Insumo
    lote_payload = {
        "insumo_id": "01a11481-0000-7000-8000-000000000001",
        "codigo_lote": "LOTE-SEED-001",
        "quantidade_inicial": 1000.0,
        "quantidade_atual": 1000.0,
        "entrada_em": "2026-01-01T00:00:00Z"
    }
    response = await async_client.post("/api/v1/operacional/insumos/lotes", json=lote_payload, headers=headers)
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["codigo_lote"] == "LOTE-SEED-001"
    assert float(data["quantidade_inicial"]) == 1000.0

from uuid import UUID
from datetime import date
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from src.operacional.domain.models import Safra

@pytest.mark.asyncio
async def test_viabilidade_calculation(async_client: AsyncClient, auth_token: str, session: AsyncSession):
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # 1. Safra inexistente retorna 404
    payload_inexistente = {
        "safra_id": "01a11481-0000-7000-8000-999999999999",
        "custo_mao_obra": 5000.0,
        "custo_frete": 1500.0,
        "custo_impostos": 800.0,
        "preco_mercado_saca": 135.0
    }
    resp_404 = await async_client.post("/api/v1/operacional/viabilidade/calcular", json=payload_inexistente, headers=headers)
    assert resp_404.status_code == 404

    # 2. Obter propriedade_id do usuário logado e criar Safra
    resp_me = await async_client.get("/api/v1/auth/me", headers=headers)
    assert resp_me.status_code == 200
    propriedade_id = UUID(resp_me.json()["propriedade_id"])

    safra_id = UUID("01a11481-0000-7000-8000-000000000002")
    safra = Safra(
        id=safra_id,
        propriedade_id=propriedade_id,
        talhao_id=UUID("01a11481-0000-7000-8000-000000000003"),
        cultura="Soja",
        data_plantio=date(2026, 1, 1),
        produtividade_estimada=Decimal("3000.00"),
        status="EM_ANDAMENTO"
    )
    session.add(safra)
    await session.commit()

    # 3. Cálculo de viabilidade com Safra existente retorna 200 e métricas
    payload_valido = {
        "safra_id": str(safra_id),
        "custo_mao_obra": 5000.0,
        "custo_frete": 1500.0,
        "custo_impostos": 800.0,
        "preco_mercado_saca": 135.0
    }
    response = await async_client.post("/api/v1/operacional/viabilidade/calcular", json=payload_valido, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "custo_total" in data
    assert "break_even_sacas" in data
    assert "cenarios" in data
    assert len(data["cenarios"]) == 3
