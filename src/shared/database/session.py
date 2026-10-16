import logging
import re
from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from src.shared.config import get_settings

logger = logging.getLogger("seed.database")
settings = get_settings()

db_url = settings.DATABASE_URL or "sqlite+aiosqlite:///./seed.db"
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Se houver sslmode=... na URL, normaliza para ssl=require para asyncpg
if "sslmode=" in db_url:
    db_url = re.sub(r"sslmode=[^&]+", "ssl=require", db_url)

is_sqlite = db_url.startswith("sqlite")
engine = create_async_engine(
    db_url,
    echo=(settings.LOG_LEVEL == "DEBUG"),
    pool_pre_ping=not is_sqlite
)

async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

async def init_db() -> None:
    """
    Inicializa conexões e realiza a criação automática de tabelas e seed inicial se necessário.
    """
    import src.shared.database.models  # noqa: F401
    import src.operacional.domain.models  # noqa: F401
    import src.epidemiologico.domain.models  # noqa: F401
    import src.energetico.domain.models  # noqa: F401
    import src.sync_engine.models  # noqa: F401
    from src.shared.database.base import Base
    from src.shared.database.seed_data import seed_admin_padrao

    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Esquema de banco de dados verificado/criado com sucesso.")
    except Exception as exc:
        logger.warning("Aviso durante verificação de schema: %s", exc)

    try:
        async with async_session_maker() as session:
            await seed_admin_padrao(session)
    except Exception as exc:
        logger.warning("Aviso durante seed inicial: %s", exc)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Gerador assíncrono para fornecer a sessão do banco de dados ao FastAPI via injeção de dependências.
    """
    async with async_session_maker() as session:
        yield session

