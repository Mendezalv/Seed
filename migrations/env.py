import asyncio
import os
import sys
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context
import geoalchemy2  # Ensure GeoAlchemy2 types are loaded

# Add the project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Importa Base e todos os models para que o autogenerate do Alembic os detecte
from src.shared.database.base import Base  # noqa: E402

# Importar todos os módulos de models para registrar no metadata
import src.shared.database.models  # noqa: F401, E402  (Propriedade)
import src.operacional.domain.models  # noqa: F401, E402
import src.epidemiologico.domain.models  # noqa: F401, E402
import src.energetico.domain.models  # noqa: F401, E402
import src.sync_engine.models  # noqa: F401, E402

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# MetaData do SQLAlchemy para suporte a autogenerate
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

def get_url():
    return os.getenv("DATABASE_URL", "postgresql+asyncpg://agrohub:agrohub_dev@localhost:5433/agrohub")

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=geoalchemy2.alembic_helpers.include_object,
        process_revision_directives=geoalchemy2.alembic_helpers.writer,
        render_item=geoalchemy2.alembic_helpers.render_item
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_object=geoalchemy2.alembic_helpers.include_object,
        process_revision_directives=geoalchemy2.alembic_helpers.writer,
        render_item=geoalchemy2.alembic_helpers.render_item
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = get_url()

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
