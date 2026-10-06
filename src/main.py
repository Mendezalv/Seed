"""
AgroHub API — Ponto de entrada da aplicação FastAPI.

Hub de Gestão e Inteligência Agropecuária.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.shared.config import get_settings
from src.shared.database.session import init_db
from src.shared.auth.middleware import TenantMiddleware

from src.operacional.api.routes import router as operacional_router
from src.epidemiologico.api.routes import router as epidemiologico_router
from src.energetico.api.routes import router as energetico_router
from src.sync_engine.api.routes import router as sync_router

# Configurações de log
logging.basicConfig(level=get_settings().LOG_LEVEL)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gerenciador de contexto de tempo de vida da aplicação FastAPI.
    Inicializa o pool de conexões com o banco de dados na inicialização.
    """
    await init_db()
    yield


app = FastAPI(
    title="Seed API",
    version="0.1.0",
    description=(
        "Seed — Hub de Gestão e Inteligência Agropecuária: "
        "Otimização de custos, vigilância epidemiológica e sustentabilidade energética."
    ),
    lifespan=lifespan,
)

# Middleware de isolamento por tenant
app.add_middleware(TenantMiddleware)

# CORS — permite todas as origens em desenvolvimento
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Roteadores dos módulos de domínio
app.include_router(operacional_router, prefix="/api/v1")
app.include_router(epidemiologico_router, prefix="/api/v1")
app.include_router(energetico_router, prefix="/api/v1")
app.include_router(sync_router, prefix="/api/v1")

# Roteadores de autenticação e propriedade
from src.shared.auth.routes import router as auth_router
from src.shared.auth.propriedade_routes import router as propriedade_router

app.include_router(auth_router, prefix="/api/v1")
app.include_router(propriedade_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    """Endpoint de checagem de saúde da API."""
    return {"status": "ok", "environment": settings.ENVIRONMENT}


@app.get("/", tags=["Info"])
async def root():
    """Endpoint raiz com informações da API."""
    return {
        "api": "Seed API",
        "version": "0.1.0",
        "description": "Seed — Hub de Gestão e Inteligência Agropecuária",
        "docs": "/docs",
        "status": "online",
    }
