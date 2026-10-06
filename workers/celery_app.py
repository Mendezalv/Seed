"""
Configuração do Celery para workers assíncronos do AgroHub.

Lê broker/backend URL das variáveis de ambiente para funcionar
tanto em Docker Compose quanto localmente.
"""

import os

from celery import Celery

from workers.config import CELERY_BEAT_SCHEDULE

# Usa variáveis de ambiente com fallback para desenvolvimento local
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6380/0")

app = Celery("seed_workers")

app.conf.update(
    broker_url=REDIS_URL,
    result_backend=REDIS_URL,
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Sao_Paulo",
    enable_utc=True,
    beat_schedule=CELERY_BEAT_SCHEDULE,
    # Configurações de resiliência
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_reject_on_worker_lost=True,
)

app.autodiscover_tasks(["workers"])
