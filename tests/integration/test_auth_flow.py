import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_protected_endpoint_rejects_unauthenticated(async_client: AsyncClient):
    response = await async_client.get("/auth/me")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_full_auth_flow(async_client: AsyncClient):
    # 1. Register creates both user and propriedade
    register_payload = {
        "email": "test@agrohub.com",
        "nome_completo": "Test User",
        "senha": "TestPassword123!",
        "propriedade": {
            "nome": "Fazenda Teste",
            "cnpj_cpf": "12345678901",
        }
    }
    response = await async_client.post("/auth/register", json=register_payload)
    assert response.status_code in [200, 201]
    data = response.json()
    assert "user_id" in data or "id" in data
    
    # 2. Login returns valid JWT
    login_payload = {
        "username": "test@agrohub.com",
        "password": "TestPassword123!"
    }
    response = await async_client.post("/auth/login", data=login_payload)
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    
    token = token_data["access_token"]
    
    # 3. /auth/me returns user info
    headers = {"Authorization": f"Bearer {token}"}
    response = await async_client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == "test@agrohub.com"
