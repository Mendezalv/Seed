"""
Modelo de Propriedade — entidade raiz para multitenancy.

Toda entidade no sistema referencia uma propriedade_id,
garantindo isolamento de dados entre propriedades rurais.
"""

from uuid import UUID
from decimal import Decimal
from datetime import datetime

from sqlalchemy import String, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from uuid_utils import uuid7

from src.shared.database.base import Base, TimestampMixin


class Propriedade(Base, TimestampMixin):
    """
    Propriedade rural — unidade raiz de multitenancy.
    Representa uma fazenda, sítio ou estância cadastrada no sistema.
    """

    __tablename__ = "propriedades"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    cnpj_cpf: Mapped[str | None] = mapped_column(String(18), unique=True, nullable=True)
    inscricao_estadual: Mapped[str | None] = mapped_column(String(20), nullable=True)
    endereco: Mapped[str | None] = mapped_column(String(500), nullable=True)
    municipio: Mapped[str | None] = mapped_column(String(200), nullable=True)
    estado: Mapped[str | None] = mapped_column(String(2), nullable=True)
    area_total_hectares: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    car_numero: Mapped[str | None] = mapped_column(
        String(50), nullable=True, comment="Cadastro Ambiental Rural"
    )
    status: Mapped[str] = mapped_column(String(20), default="ATIVA")


class Usuario(Base, TimestampMixin):
    __tablename__ = 'usuarios'
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    nome_completo: Mapped[str] = mapped_column(String(255), nullable=False)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    propriedade_id: Mapped[UUID] = mapped_column(ForeignKey('propriedades.id'), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default='OPERADOR')
    ativo: Mapped[bool] = mapped_column(default=True)
    ultimo_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    propriedade: Mapped['Propriedade'] = relationship()
