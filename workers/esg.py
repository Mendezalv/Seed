from celery import shared_task
from workers.db import engine, SessionLocal

@shared_task(name='workers.esg.gerar_relatorios_mensais')
def gerar_relatorios_mensais():
    with engine.connect() as conn:
        print("Generating ESG reports")
        # Mock implementation
        return {"status": "success", "reports_generated": 10}
