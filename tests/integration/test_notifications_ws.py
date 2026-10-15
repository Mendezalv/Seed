"""
Testes de integração para as rotas REST e canal WebSocket de Notificações da Plataforma Seed.
"""

from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from starlette.websockets import WebSocketDisconnect

from src.main import app
from src.shared.auth.jwt import create_access_token


@pytest.fixture
def auth_credentials(client: TestClient) -> tuple[str, UUID, UUID]:
    """Registra e autentica um produtor retornando token, user_id e propriedade_id."""
    register_payload = {
        "email": "notif_operator@seed.agro",
        "nome_completo": "Operador Central de Notificações",
        "senha": "SenhaSegura123!",
        "role": "GERENTE",
    }
    client.post("/api/v1/auth/registro", json=register_payload)
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "notif_operator@seed.agro", "senha": "SenhaSegura123!"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    user_id = UUID(me_resp.json()["id"])
    prop_id = UUID(me_resp.json()["propriedade_id"])
    return token, user_id, prop_id


@pytest.mark.asyncio
async def test_rest_notifications_flow(
    async_client: AsyncClient,
    session,
):
    # Cadastra usuário de teste
    reg_payload = {
        "email": "rest_tester@seed.agro",
        "nome_completo": "Tester REST",
        "senha": "SenhaForte123!",
        "role": "ADMIN",
    }
    await async_client.post("/api/v1/auth/registro", json=reg_payload)
    log_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "rest_tester@seed.agro", "senha": "SenhaForte123!"},
    )
    token = log_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Lista inicial (deve estar vazia para este tenant recém-criado)
    resp = await async_client.get("/api/v1/notificacoes", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["total_nao_lidas"] == 0
    assert data["items"] == []

    # 2. Emite notificação simulada
    simular_payload = {
        "tipo": "EPIDEMIOLOGICO",
        "titulo": "Foco de Mancha Alvo",
        "mensagem": "Severidade alta no Talhão 01",
        "severidade": "CRITICA",
        "link_acao": "/vigilancia",
    }
    create_resp = await async_client.post(
        "/api/v1/notificacoes/simular",
        json=simular_payload,
        headers=headers,
    )
    assert create_resp.status_code == 200
    notif_id = create_resp.json()["id"]
    assert create_resp.json()["titulo"] == "Foco de Mancha Alvo"
    assert create_resp.json()["lida"] is False

    # 3. Lista novamente com a notificação criada
    list_resp = await async_client.get("/api/v1/notificacoes", headers=headers)
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] == 1
    assert list_resp.json()["total_nao_lidas"] == 1

    # 4. Marca como lida
    read_resp = await async_client.patch(
        f"/api/v1/notificacoes/{notif_id}/lida",
        headers=headers,
    )
    assert read_resp.status_code == 200
    assert read_resp.json()["lida"] is True

    # 5. Valida que contador de não lidas zerou
    after_read = await async_client.get("/api/v1/notificacoes", headers=headers)
    assert after_read.json()["total_nao_lidas"] == 0

    # 6. Cria mais uma e marca todas como lidas
    await async_client.post(
        "/api/v1/notificacoes/simular",
        json={
            "tipo": "MANUTENCAO",
            "titulo": "Filtro de Ar",
            "mensagem": "Substituir filtro",
            "severidade": "MEDIA",
        },
        headers=headers,
    )
    mark_all_resp = await async_client.post(
        "/api/v1/notificacoes/marcar-todas-lidas",
        headers=headers,
    )
    assert mark_all_resp.status_code == 200
    assert mark_all_resp.json()["atualizadas"] == 1


def test_websocket_notifications_connection_and_heartbeat(sample_propriedade_id, sample_user_id):
    test_client = TestClient(app)

    # 1. Sem token ou com token inválido deve fechar conexão
    with pytest.raises(WebSocketDisconnect) as exc_info:
        with test_client.websocket_connect("/api/v1/ws/notificacoes?token=token_falso"):
            pass
    assert exc_info.value.code == 1008

    # 2. Gera token JWT válido para o tenant de teste
    token = create_access_token(
        data={
            "sub": str(sample_user_id),
            "org": str(sample_propriedade_id),
            "role": "GERENTE",
            "permissions": [],
        }
    )

    # 3. Conexão bem-sucedida com token válido
    with test_client.websocket_connect(f"/api/v1/ws/notificacoes?token={token}") as ws:
        # Recebe mensagem de boas-vindas
        welcome = ws.receive_json()
        assert welcome["type"] == "CONNECTED"
        assert welcome["propriedade_id"] == str(sample_propriedade_id)

        # Testa Heartbeat (Ping/Pong)
        ws.send_text('{"type": "ping"}')
        pong = ws.receive_json()
        assert pong["type"] == "pong"
