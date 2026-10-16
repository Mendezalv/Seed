import logging
import urllib.parse
from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from src.shared.config import get_settings

logger = logging.getLogger("seed.database")
settings = get_settings()

def clean_asyncpg_url(url: str | None) -> str:
    """
    Normaliza URLs de PostgreSQL em nuvem (Neon, Supabase, Render) para asyncpg,
    removendo parâmetros exclusivos do libpq como channel_binding.
    """
    if not url:
        return "sqlite+aiosqlite:///./seed.db"

    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    if url.startswith("sqlite"):
        return url

    parsed = urllib.parse.urlsplit(url)
    if not parsed.query:
        return url

    query_params = urllib.parse.parse_qsl(parsed.query)
    cleaned_params: list[tuple[str, str]] = []
    has_ssl = False

    for k, v in query_params:
        # Descarta parâmetros libpq incompatíveis com kwargs do asyncpg.connect()
        if k in ("channel_binding", "gssencmode", "target_session_attrs"):
            continue
        if k == "sslmode":
            if not has_ssl:
                cleaned_params.append(("ssl", "require"))
                has_ssl = True
        elif k == "ssl":
            cleaned_params.append((k, v))
            has_ssl = True
        else:
            cleaned_params.append((k, v))

    new_query = urllib.parse.urlencode(cleaned_params)
    return urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, parsed.path, new_query, parsed.fragment))

db_url = clean_asyncpg_url(settings.DATABASE_URL)
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

    from sqlalchemy import text

    if not is_sqlite:
        try:
            async with engine.begin() as conn:
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            logger.info("Extensão PostGIS habilitada com sucesso.")
        except Exception as exc:
            logger.warning("Aviso ao tentar habilitar PostGIS: %s", exc)

    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Esquema de banco de dados verificado/criado com sucesso.")
    except Exception as exc:
        logger.error("Erro durante verificação/criação de schema: %s", exc)

    try:
        async with async_session_maker() as session:
            await seed_admin_padrao(session)
        logger.info("Seed de usuário administrador verificado com sucesso.")
    except Exception as exc:
        logger.warning("Aviso durante seed inicial: %s", exc)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Gerador assíncrono para fornecer a sessão do banco de dados ao FastAPI via injeção de dependências.
    """
    async with async_session_maker() as session:
        yield session

