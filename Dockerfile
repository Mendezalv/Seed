# ==============================================================================
# Stage 1: Builder
# ==============================================================================
FROM python:3.12-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install --no-cache-dir build

COPY pyproject.toml README.md /app/
RUN pip install --no-cache-dir .

# ==============================================================================
# Stage 2: Hardened Runtime
# ==============================================================================
FROM python:3.12-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Cria usuário não-root com UID/GID seguros
RUN useradd -m -u 1001 -s /bin/bash seed

WORKDIR /app

# Copia dependências compiladas do builder
COPY --from=builder /usr/local/lib/python3.12/site-packages/ /usr/local/lib/python3.12/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

# Copia código da aplicação e scripts de suporte
COPY src /app/src
COPY workers /app/workers
COPY scripts /app/scripts
COPY migrations /app/migrations
COPY alembic.ini /app/alembic.ini

# Garante permissões adequadas
RUN chmod +x /app/scripts/entrypoint.sh && chown -R seed:seed /app

USER seed

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

ENTRYPOINT ["/app/scripts/entrypoint.sh"]
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
