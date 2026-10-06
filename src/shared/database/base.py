from datetime import datetime, timezone
import uuid
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime
import uuid_utils

class Base(DeclarativeBase):
    """
    Classe base para todos os modelos do SQLAlchemy.
    """
    pass

class IdMixin:
    """
    Mixin para gerar chaves primárias usando UUIDv7.
    """
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid_utils.uuid7
    )

class TimestampMixin:
    """
    Mixin que adiciona campos de auditoria de data e hora aos modelos.
    Utiliza timezone UTC.
    """
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc)
    )

class TenantMixin:
    """
    Mixin para isolamento de dados por propriedade (Tenant).
    Adiciona a chave estrangeira propriedade_id a cada modelo.
    """
    propriedade_id: Mapped[uuid.UUID] = mapped_column(
        index=True, nullable=False
    )
