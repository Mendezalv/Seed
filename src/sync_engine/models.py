from sqlalchemy import Column, String, Integer, Boolean, JSON, DateTime, ForeignKey, Uuid
from src.shared.database.base import Base, TimestampMixin, TenantMixin
import uuid_utils

class SyncLog(Base, TimestampMixin):
    __tablename__ = 'sync_logs'
    
    id = Column(Uuid, primary_key=True, default=uuid_utils.uuid7)
    envelope_id = Column(Uuid, unique=True, nullable=False)
    device_id = Column(String, nullable=False)
    propriedade_id = Column(Uuid, nullable=False)
    usuario_id = Column(Uuid, nullable=False)
    operations_count = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    result = Column(JSON, nullable=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)

class PendingReview(Base, TimestampMixin, TenantMixin):
    __tablename__ = 'pending_reviews'
    
    id = Column(Uuid, primary_key=True, default=uuid_utils.uuid7)
    entity_type = Column(String, nullable=False)
    entity_id = Column(Uuid, nullable=False)
    local_data = Column(JSON, nullable=False)
    remote_data = Column(JSON, nullable=False)
    device_id = Column(String, nullable=False)
    resolved = Column(Boolean, default=False, nullable=False)
    resolved_by = Column(Uuid, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolution = Column(String, nullable=True)

class SyncVersion(Base):
    __tablename__ = 'sync_versions'
    
    id = Column(Uuid, primary_key=True, default=uuid_utils.uuid7)
    propriedade_id = Column(Uuid, unique=True, nullable=False)
    current_version = Column(Integer, default=0, nullable=False)
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
