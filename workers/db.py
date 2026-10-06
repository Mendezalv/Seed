"""
Configuração da engine síncrona do SQLAlchemy para tarefas Celery.
Lê DATABASE_URL do ambiente convertendo o driver assíncrono (+asyncpg) para síncrono (+psycopg2 ou sqlite).
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

raw_db_url = os.environ.get("DATABASE_URL", "sqlite:///seed.db")

# Celery roda tarefas síncronas: converte postgresql+asyncpg para postgresql+psycopg ou sqlite
if "postgresql+asyncpg" in raw_db_url:
    sync_db_url = raw_db_url.replace("postgresql+asyncpg", "postgresql")
else:
    sync_db_url = raw_db_url

engine = create_engine(sync_db_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
