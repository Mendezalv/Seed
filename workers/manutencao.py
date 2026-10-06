from celery import shared_task
from sqlalchemy import create_engine

engine = create_engine('sqlite:///agrohub.db')

@shared_task(name='workers.manutencao.verificar_preventivas')
def verificar_preventivas():
    with engine.connect() as conn:
        print("Checking maintenance schedules")
        # Mock implementation
        return {"status": "success", "orders_created": 3}
