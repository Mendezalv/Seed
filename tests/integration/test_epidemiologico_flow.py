import pytest
from httpx import AsyncClient

@pytest.fixture
async def gestor_token(async_client: AsyncClient) -> str:
    register_payload = {
        "email": "gestor.epi@seed.agro",
        "nome_completo": "Gestor Epidemiologia",
        "senha": "SenhaForte123!",
        "role": "GESTOR"
    }
    await async_client.post("/api/v1/auth/registro", json=register_payload)
    resp = await async_client.post("/api/v1/auth/login", json={"email": "gestor.epi@seed.agro", "senha": "SenhaForte123!"})
    return resp.json()["access_token"]

@pytest.mark.asyncio
async def test_epidemiologico_heatmap_flow(async_client: AsyncClient, gestor_token: str):
    headers = {"Authorization": f"Bearer {gestor_token}"}
    
    # Obter dados do usuário para pegar user_id
    me_resp = await async_client.get("/api/v1/auth/me", headers=headers)
    user_id = me_resp.json()["id"]

    # 1. Inserir ocorrências em coordenadas variadas
    oc1 = {
        "tipo_cultura": "Soja",
        "categoria": "Fungos",
        "agente_identificado": "Ferrugem Asiática",
        "severidade": "ALTA",
        "latitude": -12.5000,
        "longitude": -55.7000,
        "reportado_por": user_id,
        "observado_em": "2026-10-01T10:00:00Z",
        "origem": "campo"
    }
    resp1 = await async_client.post("/api/v1/epidemiologico/ocorrencias", json=oc1, headers=headers)
    assert resp1.status_code in [200, 201]

    # Segunda ocorrência no mesmo ponto com severidade CRITICA
    oc2 = {
        "tipo_cultura": "Soja",
        "categoria": "Fungos",
        "agente_identificado": "Ferrugem Asiática",
        "severidade": "CRITICA",
        "latitude": -12.5000,
        "longitude": -55.7000,
        "reportado_por": user_id,
        "observado_em": "2026-10-02T11:00:00Z",
        "origem": "campo"
    }
    resp2 = await async_client.post("/api/v1/epidemiologico/ocorrencias", json=oc2, headers=headers)
    assert resp2.status_code in [200, 201]

    # Terceira ocorrência em outro ponto mais distante (Lagarta)
    oc3 = {
        "tipo_cultura": "Milho",
        "categoria": "Insetos",
        "agente_identificado": "Lagarta-do-cartucho",
        "severidade": "MEDIA",
        "latitude": -13.1000,
        "longitude": -56.2000,
        "reportado_por": user_id,
        "observado_em": "2026-10-03T15:00:00Z",
        "origem": "campo"
    }
    resp3 = await async_client.post("/api/v1/epidemiologico/ocorrencias", json=oc3, headers=headers)
    assert resp3.status_code in [200, 201]

    # 2. Consultar mapa de calor sem filtros (deve conter 2 clusters e 3 ocorrências)
    hm_all = await async_client.get("/api/v1/epidemiologico/mapa-calor", headers=headers)
    assert hm_all.status_code == 200
    data_all = hm_all.json()
    assert data_all["total_pontos"] == 2
    assert data_all["total_ocorrencias"] == 3

    ponto_ferrugem = next(p for p in data_all["pontos"] if p["latitude"] == -12.5000)
    assert ponto_ferrugem["intensidade"] == 2
    assert ponto_ferrugem["peso_severidade"] == 7.0  # ALTA(3) + CRITICA(4)
    assert "Ferrugem Asiática" in ponto_ferrugem["agentes"]

    # 3. Filtrar mapa de calor por agente específico
    hm_agente = await async_client.get("/api/v1/epidemiologico/mapa-calor?agente=Lagarta-do-cartucho", headers=headers)
    assert hm_agente.status_code == 200
    data_agente = hm_agente.json()
    assert data_agente["total_pontos"] == 1
    assert data_agente["total_ocorrencias"] == 1
    assert data_agente["pontos"][0]["agentes"] == ["Lagarta-do-cartucho"]

    # 4. Filtrar mapa de calor por Bounding Box que engloba apenas o primeiro ponto
    hm_bbox = await async_client.get(
        "/api/v1/epidemiologico/mapa-calor?min_lat=-12.60&max_lat=-12.40&min_lon=-55.80&max_lon=-55.60",
        headers=headers
    )
    assert hm_bbox.status_code == 200
    data_bbox = hm_bbox.json()
    assert data_bbox["total_pontos"] == 1
    assert data_bbox["total_ocorrencias"] == 2

    # 5. Filtrar por severidade CRITICA
    hm_critica = await async_client.get("/api/v1/epidemiologico/mapa-calor?severidade=CRITICA", headers=headers)
    assert hm_critica.status_code == 200
    data_critica = hm_critica.json()
    assert data_critica["total_pontos"] == 1
    assert data_critica["total_ocorrencias"] == 1
    assert data_critica["pontos"][0]["peso_severidade"] == 4.0
