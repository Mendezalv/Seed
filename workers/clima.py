from celery import shared_task
from sqlalchemy import create_engine
from datetime import datetime, timedelta
import random

# Engine sync specifically for celery tasks
engine = create_engine('sqlite:///agrohub.db')

@shared_task(name='workers.clima.fetch_dados_inmet')
def fetch_dados_inmet():
    with engine.connect() as conn:
        print("Fetching INMET data for all properties")
        # Mock logic to fetch INMET
        return {"status": "success", "fetched_stations": 5}

@shared_task(name='workers.clima.fetch_dados_cptec')
def fetch_dados_cptec():
    with engine.connect() as conn:
        print("Fetching CPTEC fallback data")
        return {"status": "success", "fetched_stations": 2}
