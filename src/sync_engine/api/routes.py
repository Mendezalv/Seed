"""
Rotas da API para o módulo de Sincronização Offline.

Gerencia o envio e recebimento de dados entre dispositivos de campo
e o servidor central, incluindo resolução de conflitos.
"""

from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.database.session import get_session
from src.shared.api.dependencies import get_current_propriedade_id
from src.sync_engine.envelope import SyncEnvelopeSchema, SyncResultSchema
from src.sync_engine.conflict_resolver import ConflictResolver
from src.sync_engine.models import SyncVersion, PendingReview

router = APIRouter(prefix="/sync", tags=["Sincronização Offline"])


@router.post("/push", response_model=SyncResultSchema)
async def push_sync(
    envelope: SyncEnvelopeSchema,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session),
):
    """
    Recebe um SyncEnvelope do dispositivo de campo e processa as operações,
    aplicando as estratégias de resolução de conflitos configuradas.
    """
    resolver = ConflictResolver()
    result = await resolver.process_envelope(envelope, session)
    return result


@router.get("/pull")
async def pull_sync(
    since_version: int = Query(0, ge=0, description="Versão do servidor conhecida pelo device"),
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session),
):
    """
    Retorna todas as alterações no servidor desde a versão informada pelo device.
    Usado para atualizar o banco local do dispositivo de campo.
    """
    stmt = select(SyncVersion).where(SyncVersion.propriedade_id == propriedade_id)
    result = await session.execute(stmt)
    version = result.scalar_one_or_none()
    current_ver = version.current_version if version else 0

    changes: list[dict] = []

    # Se a versão do dispositivo já está na versão corrente do servidor, não há novos deltas
    if since_version < current_ver:
        # Busca registros atualizados/criados na propriedade
        # 1. Ocorrencias Sanitarias
        from src.epidemiologico.domain.models import OcorrenciaSanitaria
        stmt_oco = select(OcorrenciaSanitaria).where(
            OcorrenciaSanitaria.propriedade_id == propriedade_id
        ).order_by(OcorrenciaSanitaria.updated_at.desc()).limit(50)
        res_oco = await session.execute(stmt_oco)
        for oco in res_oco.scalars().all():
            changes.append({
                "entity_type": "ocorrencia_sanitaria",
                "entity_id": str(oco.id),
                "operation": "UPSERT",
                "data": {
                    "tipo_cultura": oco.tipo_cultura,
                    "agente_identificado": oco.agente_identificado,
                    "severidade": oco.severidade,
                    "latitude": oco.latitude,
                    "longitude": oco.longitude,
                    "observado_em": oco.observado_em.isoformat() if oco.observado_em else None,
                },
                "updated_at": oco.updated_at.isoformat() if oco.updated_at else None,
            })

        # 2. Alertas Epidemiologicos
        from src.epidemiologico.domain.models import AlertaEpidemiologico
        stmt_ale = select(AlertaEpidemiologico).where(
            AlertaEpidemiologico.propriedade_id == propriedade_id
        ).order_by(AlertaEpidemiologico.updated_at.desc()).limit(20)
        res_ale = await session.execute(stmt_ale)
        for ale in res_ale.scalars().all():
            changes.append({
                "entity_type": "alerta_epidemiologico",
                "entity_id": str(ale.id),
                "operation": "UPSERT",
                "data": {
                    "tipo_alerta": ale.tipo_alerta,
                    "agente": ale.agente,
                    "risco_score": ale.risco_score,
                    "latitude_centro": ale.latitude_centro,
                    "longitude_centro": ale.longitude_centro,
                    "raio_km": ale.raio_km,
                },
                "updated_at": ale.updated_at.isoformat() if ale.updated_at else None,
            })

    return {
        "current_server_version": current_ver,
        "since_version": since_version,
        "total_changes": len(changes),
        "changes": changes,
    }


@router.get("/status")
async def sync_status(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session),
):
    """
    Retorna o status atual de sincronização para a propriedade:
    versão corrente do servidor e quantidade de revisões pendentes.
    """
    stmt_ver = select(SyncVersion).where(SyncVersion.propriedade_id == propriedade_id)
    res_ver = await session.execute(stmt_ver)
    version = res_ver.scalar_one_or_none()

    stmt_rev = select(PendingReview).where(
        PendingReview.propriedade_id == propriedade_id,
        PendingReview.resolved == False,  # noqa: E712
    )
    res_rev = await session.execute(stmt_rev)
    reviews_count = len(res_rev.scalars().all())

    return {
        "current_version": version.current_version if version else 0,
        "last_sync_at": version.last_sync_at.isoformat() if version and version.last_sync_at else None,
        "pending_reviews_count": reviews_count,
    }


@router.get("/pending-reviews")
async def list_pending_reviews(
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session),
):
    """Lista revisões de conflito pendentes de resolução humana."""
    stmt = select(PendingReview).where(
        PendingReview.propriedade_id == propriedade_id,
        PendingReview.resolved == False,  # noqa: E712
    )
    result = await session.execute(stmt)
    reviews = result.scalars().all()

    return [
        {
            "id": str(r.id),
            "entity_type": r.entity_type,
            "entity_id": str(r.entity_id),
            "local_data": r.local_data,
            "remote_data": r.remote_data,
            "device_id": r.device_id,
            "created_at": r.created_at.isoformat(),
        }
        for r in reviews
    ]


@router.post("/pending-reviews/{review_id}/resolve")
async def resolve_review(
    review_id: UUID,
    resolution_data: dict,
    propriedade_id: UUID = Depends(get_current_propriedade_id),
    session: AsyncSession = Depends(get_session),
):
    """
    Resolve uma revisão pendente de conflito.
    O gestor escolhe LOCAL, REMOTE ou MERGED com dados personalizados.
    """
    stmt = select(PendingReview).where(
        PendingReview.id == review_id,
        PendingReview.propriedade_id == propriedade_id,
    )
    result = await session.execute(stmt)
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(status_code=404, detail="Revisão não encontrada")

    if review.resolved:
        raise HTTPException(status_code=409, detail="Revisão já foi resolvida")

    review.resolved = True
    review.resolved_at = datetime.now(timezone.utc)
    review.resolution = resolution_data.get("resolution", "MERGED")
    review.resolved_by = resolution_data.get("resolved_by")

    await session.commit()
    return {"status": "resolved", "review_id": str(review_id), "resolution": review.resolution}
