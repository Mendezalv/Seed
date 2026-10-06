from uuid import UUID
from dataclasses import dataclass
from typing import List, Dict, Any
from .envelope import SyncEnvelope, ConflictStrategy, OperationType
from .merge_strategies import LastWriteWins, CRDTGCounter, ManualReview
from .models import PendingReview, SyncLog, SyncVersion
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, insert
from datetime import datetime

@dataclass 
class SyncResult:
    envelope_id: UUID
    operations_applied: int
    operations_skipped: int
    conflicts_resolved: int
    conflicts_pending_review: int
    new_server_version: int
    details: List[Dict[str, Any]]

class ConflictResolver:
    def __init__(self):
        self.strategies = {
            ConflictStrategy.LWW: LastWriteWins(),
            ConflictStrategy.CRDT_COUNTER: CRDTGCounter(),
            ConflictStrategy.MANUAL_REVIEW: ManualReview(),
        }
    
    async def process_envelope(self, envelope: SyncEnvelope, session: AsyncSession) -> SyncResult:
        stmt = select(SyncLog).where(SyncLog.envelope_id == envelope.envelope_id)
        result = await session.execute(stmt)
        if result.scalar_one_or_none():
            return SyncResult(envelope.envelope_id, 0, len(envelope.operacoes), 0, 0, envelope.last_known_server_version, [{"msg": "Already processed"}])
        
        log = SyncLog(
            envelope_id=envelope.envelope_id,
            device_id=envelope.device_id,
            propriedade_id=envelope.propriedade_id,
            usuario_id=envelope.usuario_id,
            operations_count=len(envelope.operacoes),
            status='PROCESSING'
        )
        session.add(log)
        
        applied = 0
        skipped = 0
        resolved = 0
        pending = 0
        details = []
        
        for op in envelope.operacoes:
            strategy = self.strategies.get(op.conflict_strategy, LastWriteWins())
            
            if op.operation == OperationType.CREATE:
                applied += 1
            elif op.operation == OperationType.UPDATE:
                local_data = {"id": str(op.entity_id), "updated_at": op.timestamp}
                merge_res = await strategy.resolve(local_data, op.data, op)
                if merge_res.requires_review:
                    review = PendingReview(
                        entity_type=op.entity_type,
                        entity_id=op.entity_id,
                        local_data=local_data,
                        remote_data=op.data,
                        device_id=envelope.device_id,
                        propriedade_id=envelope.propriedade_id
                    )
                    session.add(review)
                    pending += 1
                else:
                    resolved += 1
                    applied += 1
            elif op.operation == OperationType.DELETE:
                applied += 1
                
        stmt_ver = select(SyncVersion).where(SyncVersion.propriedade_id == envelope.propriedade_id)
        res_ver = await session.execute(stmt_ver)
        version_rec = res_ver.scalar_one_or_none()
        
        if version_rec:
            version_rec.current_version += 1
            version_rec.last_sync_at = datetime.utcnow()
            new_version = version_rec.current_version
        else:
            session.add(SyncVersion(propriedade_id=envelope.propriedade_id, current_version=1, last_sync_at=datetime.utcnow()))
            new_version = 1
            
        log.status = 'COMPLETED'
        log.processed_at = datetime.utcnow()
        await session.commit()
        
        return SyncResult(
            envelope_id=envelope.envelope_id,
            operations_applied=applied,
            operations_skipped=skipped,
            conflicts_resolved=resolved,
            conflicts_pending_review=pending,
            new_server_version=new_version,
            details=details
        )
