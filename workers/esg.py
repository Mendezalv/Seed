from celery import shared_task
from datetime import datetime, timezone
import asyncio
from sqlalchemy import select
from workers.db import SessionLocal
from src.shared.database.models import Propriedade
from src.energetico.domain.calculadora_esg import CalculadoraESG
from src.shared.database.session import async_session_maker

@shared_task(name='workers.esg.gerar_relatorios_mensais')
def gerar_relatorios_mensais():
    """
    Gera automaticamente o relatório e balanço de carbono mensal (ESG)
    para todas as propriedades ativas do sistema na virada de cada mês.
    """
    session = SessionLocal()
    gerados = 0
    try:
        stmt = select(Propriedade).where(Propriedade.status == "ATIVA")
        propriedades = session.execute(stmt).scalars().all()
        
        hoje = datetime.now(timezone.utc)
        # Período padrão de apuração: mês anterior (ex: 2026-09)
        ano = hoje.year if hoje.month > 1 else hoje.year - 1
        mes = hoje.month - 1 if hoje.month > 1 else 12
        periodo = f"{ano}-{mes:02d}"

        async def _executar_calculos():
            count = 0
            async with async_session_maker() as async_session:
                for prop in propriedades:
                    try:
                        await CalculadoraESG.gerar_relatorio(prop.id, periodo, async_session)
                        count += 1
                    except Exception as e:
                        print(f"Erro ao processar ESG da propriedade {prop.id}: {e}")
            return count

        gerados = asyncio.run(_executar_calculos())
    except Exception as e:
        print(f"Erro geral no worker de relatórios ESG: {e}")
    finally:
        session.close()

    return {"status": "success", "periodo": periodo, "relatorios_gerados": gerados}
