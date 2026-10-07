import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_protected_endpoint_rejects_unauthenticated(async_client: AsyncClient):
    response = await async_client.get("/api/v1/auth/me")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_full_auth_flow(async_client: AsyncClient):
    # 1. Register creates both user and propriedade
    register_payload = {
        "email": "test@seed.agro",
        "nome_completo": "Produtor Rural Teste",
        "senha": "SenhaForte123!",
        "role": "ADMIN"
    }
    response = await async_client.post("/api/v1/auth/registro", json=register_payload)
    assert response.status_code in [200, 201]
    data = response.json()
    assert "id" in data
    assert data["email"] == "test@seed.agro"
    
    # 2. Login returns valid JWT
    login_payload = {
        "email": "test@seed.agro",
        "senha": "SenhaForte123!"
    }
    response = await async_client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    
    token = token_data["access_token"]
    
    # 3. /api/v1/auth/me returns user info
    headers = {"Authorization": f"Bearer {token}"}
    response = await async_client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == "test@seed.agro"
