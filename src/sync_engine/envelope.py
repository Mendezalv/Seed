from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID
from enum import StrEnum
from typing import Optional, Dict, List, Any
from pydantic import BaseModel, Field

class ConflictStrategy(StrEnum):
    LWW = 'LWW'
    CRDT_COUNTER = 'CRDT_COUNTER'
    MANUAL_REVIEW = 'MANUAL_REVIEW'

class OperationType(StrEnum):
    CREATE = 'CREATE'
    UPDATE = 'UPDATE'
    DELETE = 'DELETE'

@dataclass
class SyncOperation:
    sync_id: UUID
    entity_type: str
    operation: OperationType
    entity_id: UUID
    data: dict
    timestamp: datetime
    conflict_strategy: ConflictStrategy

@dataclass
class SyncEnvelope:
    envelope_id: UUID
    device_id: str
    propriedade_id: UUID
    usuario_id: UUID
    last_known_server_version: int
    device_version_vector: dict[str, int]
    operacoes: list[SyncOperation]
    checksum_sha256: str
    compressed: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
    sent_at: datetime | None = None

class SyncOperationSchema(BaseModel):
    sync_id: UUID
    entity_type: str
    operation: OperationType
    entity_id: UUID
    data: Dict[str, Any]
    timestamp: datetime
    conflict_strategy: ConflictStrategy

class SyncEnvelopeSchema(BaseModel):
    envelope_id: UUID
    device_id: str
    propriedade_id: UUID
    usuario_id: UUID
    last_known_server_version: int
    device_version_vector: Dict[str, int]
    operacoes: List[SyncOperationSchema]
    checksum_sha256: str
    compressed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    sent_at: Optional[datetime] = None

class SyncResultSchema(BaseModel):
    envelope_id: UUID
    operations_applied: int
    operations_skipped: int
    conflicts_resolved: int
    conflicts_pending_review: int
    new_server_version: int
    details: List[Dict[str, Any]]
