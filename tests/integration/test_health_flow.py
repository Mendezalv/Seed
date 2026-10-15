"""
Testes de integração para os probes de saúde e prontidão (Liveness & Readiness).
"""

from unittest.mock import AsyncMock

import pytest
from httpx import AsyncClient

from src.shared.database.session import get_session


@pytest.mark.asyncio
async def test_health_check_public_and_healthy(async_client: AsyncClient):
    """Verifica que /health e /api/v1/health são públicos e retornam 200 em estado saudável."""
    # 1. Rota raiz /health
    resp = await async_client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "environment" in data
    assert data["components"]["database"]["status"] == "connected"
    assert "cache" in data["components"]

    # 2. Rota versionada /api/v1/health
    resp_v1 = await async_client.get("/api/v1/health")
    assert resp_v1.status_code == 200
    data_v1 = resp_v1.json()
    assert data_v1["status"] == "healthy"
    assert data_v1["components"]["database"]["status"] == "connected"


@pytest.mark.asyncio
async def test_health_check_database_failure(async_client: AsyncClient):
    """Verifica que falha de banco de dados resulta em status HTTP 503 Service Unavailable."""
    from src.main import app

    mock_failing_session = AsyncMock()
    mock_failing_session.execute.side_effect = ConnectionRefusedError(
        "PostgreSQL connection refused"
    )

    async def override_failing_session():
        yield mock_failing_session

    app.dependency_overrides[get_session] = override_failing_session
    try:
        resp = await async_client.get("/health")
        assert resp.status_code == 503
        data = resp.json()
        assert data["status"] == "unhealthy"
        assert data["components"]["database"]["status"] == "error"
        assert "connection refused" in data["components"]["database"]["error"].lower()
    finally:
        # Reverte override
        app.dependency_overrides.pop(get_session, None)
