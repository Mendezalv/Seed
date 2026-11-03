import uuid
from datetime import UTC, datetime

import uuid_utils
from sqlalchemy import DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """
    Classe base para todos os modelos do SQLAlchemy.
    """
    pass

def generate_uuid7() -> uuid.UUID:
    """Gera UUIDv7 compatível com a biblioteca padrão uuid.UUID."""
    return uuid.UUID(str(uuid_utils.uuid7()))

class IdMixin:
    """
    Mixin para gerar chaves primárias usando UUIDv7.
    """
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=generate_uuid7
    )

class TimestampMixin:
    """
    Mixin que adiciona campos de auditoria de data e hora aos modelos.
    Utiliza timezone UTC.
    """
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC)
    )

class TenantMixin:
    """
    Mixin para isolamento de dados por propriedade (Tenant).
    Adiciona a chave estrangeira propriedade_id a cada modelo.
    """
    propriedade_id: Mapped[uuid.UUID] = mapped_column(
        index=True, nullable=False
    )
