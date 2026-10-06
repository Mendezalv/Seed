from celery import shared_task
from workers.db import engine, SessionLocal

@shared_task(name='workers.epidemiologico.processar_alertas')
def processar_alertas():
    with engine.connect() as conn:
        print("Processing alerts")
        # Mock implementation for calculating risk and generating alerts
        return {"status": "success", "alerts_generated": 2}
