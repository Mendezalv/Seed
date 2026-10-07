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

@pytest.mark.asyncio
async def test_gestao_membros_propriedade(async_client: AsyncClient):
    # 1. Registrar Admin proprietário
    admin_reg = {
        "email": "admin.fazenda@seed.agro",
        "nome_completo": "Administrador Fazenda",
        "senha": "SenhaForte123!",
        "role": "ADMIN"
    }
    await async_client.post("/api/v1/auth/registro", json=admin_reg)
    resp_login = await async_client.post("/api/v1/auth/login", json={"email": "admin.fazenda@seed.agro", "senha": "SenhaForte123!"})
    admin_token = resp_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Adicionar Operador na mesma propriedade
    membro_payload = {
        "email": "tratorista@seed.agro",
        "nome_completo": "Tratorista Silva",
        "senha": "SenhaSegura123!",
        "role": "OPERADOR"
    }
    resp_add = await async_client.post("/api/v1/propriedades/minha/membros", json=membro_payload, headers=admin_headers)
    assert resp_add.status_code == 201
    membro_data = resp_add.json()
    assert membro_data["email"] == "tratorista@seed.agro"
    assert membro_data["role"] == "OPERADOR"
    membro_id = membro_data["id"]

    # 3. Listar membros da propriedade
    resp_list = await async_client.get("/api/v1/propriedades/minha/membros", headers=admin_headers)
    assert resp_list.status_code == 200
    membros = resp_list.json()
    assert len(membros) == 2
    emails = [m["email"] for m in membros]
    assert "admin.fazenda@seed.agro" in emails
    assert "tratorista@seed.agro" in emails

    # 4. Promover membro para GESTOR
    resp_patch = await async_client.patch(
        f"/api/v1/propriedades/minha/membros/{membro_id}",
        json={"role": "GESTOR"},
        headers=admin_headers
    )
    assert resp_patch.status_code == 200
    assert resp_patch.json()["role"] == "GESTOR"

    # 5. Desativar membro
    resp_del = await async_client.delete(
        f"/api/v1/propriedades/minha/membros/{membro_id}",
        headers=admin_headers
    )
    assert resp_del.status_code == 200
    assert resp_del.json()["ativo"] is False

    # 6. Tentativa de login do membro desativado deve retornar 403
    resp_login_desativado = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "tratorista@seed.agro", "senha": "SenhaSegura123!"}
    )
    assert resp_login_desativado.status_code == 403
