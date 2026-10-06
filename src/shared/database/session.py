from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from src.shared.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=(settings.LOG_LEVEL == "DEBUG"),
    pool_pre_ping=True
)

async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

async def init_db() -> None:
    """
    Inicializa conexões ou realiza procedimentos necessários no banco de dados.
    """
    pass

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Gerador assíncrono para fornecer a sessão do banco de dados ao FastAPI via injeção de dependências.
    """
    async with async_session_maker() as session:
        yield session
