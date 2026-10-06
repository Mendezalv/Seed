"""
Configuração de fixtures para os testes do AgroHub.

Usa SQLite async em memória para testes unitários,
evitando dependência de PostgreSQL/PostGIS nos testes locais.
"""

import pytest
import pytest_asyncio
from uuid import UUID
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from httpx import ASGITransport, AsyncClient

from src.shared.database.base import Base
from src.shared.database.session import get_session
from src.shared.auth.jwt import create_access_token
from src.main import app


SAMPLE_PROPRIEDADE_ID = UUID("12345678-1234-5678-1234-567812345678")
SAMPLE_USER_ID = UUID("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")


@pytest_asyncio.fixture
async def engine():
    """Cria engine SQLite async em memória para testes."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def session(engine):
    """Cria sessão de teste com rollback automático."""
    session_maker = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with session_maker() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(session):
    """
    Cliente HTTP de teste com override de dependências.
    Substitui get_session pela sessão de teste em memória.
    """
    async def override_get_session():
        yield session

    app.dependency_overrides[get_session] = override_get_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_propriedade_id() -> UUID:
    """UUID fixo para testes de tenant."""
    return SAMPLE_PROPRIEDADE_ID


@pytest.fixture
def sample_user_id() -> UUID:
    """UUID fixo para testes de usuário."""
    return SAMPLE_USER_ID


@pytest.fixture
def auth_headers(sample_propriedade_id, sample_user_id) -> dict[str, str]:
    """Headers de autenticação com JWT válido para testes."""
    token = create_access_token(
        data={
            "sub": str(sample_user_id),
            "org": str(sample_propriedade_id),
            "role": "ADMIN",
            "permissions": [
                "read:dashboard",
                "create:data",
                "approve:maintenance",
                "config:property",
                "admin:users",
                "read:reports",
                "create:reports",
            ],
        }
    )
    return {"Authorization": f"Bearer {token}"}
