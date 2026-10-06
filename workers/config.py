from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'sync_clima_inmet': {
        'task': 'workers.clima.fetch_dados_inmet',
        'schedule': crontab(minute=0, hour='*/6'),
    },
    'sync_cotacoes_cepea': {
        'task': 'workers.cotacoes.fetch_cepea',
        'schedule': crontab(minute=30, hour=18),
    },
    'sync_cambio_bcb': {
        'task': 'workers.cotacoes.fetch_ptax',
        'schedule': crontab(minute=0, hour=19),
    },
    'processar_alertas_sanitarios': {
        'task': 'workers.epidemiologico.processar_alertas',
        'schedule': crontab(minute='*/30'),
    },
    'gerar_relatorios_esg': {
        'task': 'workers.esg.gerar_relatorios_mensais',
        'schedule': crontab(minute=0, hour=3, day_of_month='1'),
    },
    'verificar_manutencoes': {
        'task': 'workers.manutencao.verificar_preventivas',
        'schedule': crontab(minute=0, hour='*/6'),
    },
}
