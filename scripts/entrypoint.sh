#!/bin/bash
set -e

# ==============================================================================
# Seed Platform - Production Container Entrypoint
# ==============================================================================

echo "[entrypoint] Iniciando container Seed Platform..."

# Espera ativa pela disponibilidade do PostgreSQL
if [ -n "$DATABASE_URL" ]; then
    echo "[entrypoint] Verificando conectividade com o banco de dados..."
    python - <<'EOF'
import os
import sys
import time
from sqlalchemy import create_engine, text

db_url = os.environ.get("DATABASE_URL", "")
# Converte driver asyncpg para psycopg ou sync básico se necessário para o check
sync_url = db_url.replace("+asyncpg", "")

max_retries = 30
retry_interval = 2

for attempt in range(1, max_retries + 1):
    try:
        engine = create_engine(sync_url, pool_pre_ping=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print(f"[entrypoint] PostgreSQL conectado com sucesso na tentativa {attempt}!")
        sys.exit(0)
    except Exception as exc:
        print(f"[entrypoint] Aguardando PostgreSQL ({attempt}/{max_retries}): {exc}")
        time.sleep(retry_interval)

print("[entrypoint] ERRO: Falha ao conectar ao PostgreSQL após tempo limite.")
sys.exit(1)
EOF
fi

# Executa migrações Alembic se for container de API ou migrador explícito
if [ "$RUN_MIGRATIONS" = "true" ] || [ "$1" = "uvicorn" ]; then
    echo "[entrypoint] Executando migrações Alembic (alembic upgrade head)..."
    alembic upgrade head
    echo "[entrypoint] Migrações concluídas com sucesso!"

    # Executa seed de banco de dados se configurado
    if [ "$SEED_DATABASE" = "true" ]; then
        echo "[entrypoint] Executando seed inicial da base de dados..."
        python -m scripts.seed_database || echo "[entrypoint] Seed já executado ou concluído."
    fi
fi

echo "[entrypoint] Executando comando: $@"
exec "$@"
