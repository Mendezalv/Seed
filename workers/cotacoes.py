from celery import shared_task
from workers.db import engine, SessionLocal

@shared_task(name='workers.cotacoes.fetch_cepea')
def fetch_cepea():
    with engine.connect() as conn:
        print("Fetching CEPEA prices")
        # Mock implementation
        return {"status": "success", "prices_updated": 4}

@shared_task(name='workers.cotacoes.fetch_ptax')
def fetch_ptax():
    with engine.connect() as conn:
        print("Fetching PTAX rates")
        # Mock implementation
        return {"status": "success", "rate": 5.12}
