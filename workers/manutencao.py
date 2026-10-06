from celery import shared_task
from decimal import Decimal
from sqlalchemy import select
from workers.db import SessionLocal
from src.operacional.domain.models import Maquinario, OrdemManutencao

@shared_task(name='workers.manutencao.verificar_preventivas')
def verificar_preventivas():
    """
    Varre todos os maquinários agrícolas cadastrados no sistema.
    Gera Ordens de Manutenção Preventiva quando o horímetro atingir o limite programado.
    """
    session = SessionLocal()
    ordens_criadas = 0
    try:
        stmt = select(Maquinario).where(
            Maquinario.horimetro_atual >= Maquinario.proximo_servico_em,
            Maquinario.status == "OPERACIONAL"
        )
        maquinas = session.execute(stmt).scalars().all()

        for maq in maquinas:
            # Verifica se já não há ordem preventiva pendente para a máquina
            stmt_pendente = select(OrdemManutencao).where(
                OrdemManutencao.maquinario_id == maq.id,
                OrdemManutencao.status.in_(["PENDENTE", "EM_ANDAMENTO"])
            )
            existente = session.execute(stmt_pendente).scalar_one_or_none()
            if not existente:
                nova_ordem = OrdemManutencao(
                    propriedade_id=maq.propriedade_id,
                    maquinario_id=maq.id,
                    tipo="PREVENTIVA",
                    descricao=f"Manutenção preventiva de rotina disparada automaticamente. Horímetro atual: {maq.horimetro_atual}h.",
                    horimetro_na_abertura=maq.horimetro_atual,
                    status="PENDENTE",
                    prioridade="ALTA" if maq.horimetro_atual > (maq.proximo_servico_em + Decimal("50")) else "MEDIA"
                )
                maq.status = "MANUTENCAO"
                # Reprograma próximo serviço com base no intervalo padrão
                maq.proximo_servico_em = maq.horimetro_atual + (maq.intervalo_preventiva or Decimal("500"))
                session.add(nova_ordem)
                ordens_criadas += 1

        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Erro ao verificar preventivas de maquinários: {e}")
    finally:
        session.close()

    return {"status": "success", "ordens_criadas": ordens_criadas}
