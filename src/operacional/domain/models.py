from uuid import UUID
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import String, Integer, Date, DateTime, Numeric, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from uuid_utils import uuid7

from src.shared.database.base import Base, TimestampMixin, TenantMixin

class Insumo(Base, TimestampMixin):
    __tablename__ = 'insumos'
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    tipo: Mapped[str] = mapped_column(String(50))
    nome: Mapped[str] = mapped_column(String(255))
    unidade_medida: Mapped[str] = mapped_column(String(20))
    preco_unitario: Mapped[Decimal] = mapped_column(Numeric(10, 2))

class LoteInsumo(Base, TimestampMixin, TenantMixin):
    __tablename__ = 'lotes_insumo'
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    insumo_id: Mapped[UUID] = mapped_column(ForeignKey('insumos.id'))
    codigo_lote: Mapped[str] = mapped_column(String(100))
    quantidade_inicial: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    quantidade_atual: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    data_validade: Mapped[date | None] = mapped_column(Date, nullable=True)
    fornecedor: Mapped[str | None] = mapped_column(String(255), nullable=True)
    entrada_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    insumo: Mapped["Insumo"] = relationship()

class Talhao(Base, TimestampMixin, TenantMixin):
    __tablename__ = 'talhoes'
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    nome: Mapped[str] = mapped_column(String(255))
    area_hectares: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    geometria = mapped_column(Geometry('POLYGON'), nullable=True)
    cultura_atual: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="ATIVO")

class Safra(Base, TimestampMixin, TenantMixin):
    __tablename__ = 'safras'
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    talhao_id: Mapped[UUID] = mapped_column(ForeignKey('talhoes.id'))
    cultura: Mapped[str] = mapped_column(String(100))
    variedade: Mapped[str | None] = mapped_column(String(100), nullable=True)
    data_plantio: Mapped[date] = mapped_column(Date)
    data_colheita: Mapped[date | None] = mapped_column(Date, nullable=True)
    produtividade_estimada: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    produtividade_real: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="PLANEJADA")

    talhao: Mapped["Talhao"] = relationship()

class AlocacaoInsumo(Base, TimestampMixin, TenantMixin):
    __tablename__ = 'alocacoes_insumo'
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    lote_insumo_id: Mapped[UUID] = mapped_column(ForeignKey('lotes_insumo.id'))
    safra_id: Mapped[UUID] = mapped_column(ForeignKey('safras.id'))
    talhao_id: Mapped[UUID] = mapped_column(ForeignKey('talhoes.id'))
    quantidade: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    area_hectares: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    operador_id: Mapped[UUID] = mapped_column(nullable=False)
    aplicado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    metadata_campo: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    sync_id: Mapped[UUID | None] = mapped_column(unique=True, nullable=True)

    lote_insumo: Mapped["LoteInsumo"] = relationship()
    safra: Mapped["Safra"] = relationship()
    talhao: Mapped["Talhao"] = relationship()

class Maquinario(Base, TimestampMixin, TenantMixin):
    __tablename__ = 'maquinarios'
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    nome: Mapped[str] = mapped_column(String(255))
    tipo: Mapped[str] = mapped_column(String(50))
    modelo: Mapped[str | None] = mapped_column(String(100), nullable=True)
    ano_fabricacao: Mapped[int | None] = mapped_column(Integer, nullable=True)
    horimetro_atual: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal('0'))
    intervalo_preventiva: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal('500'))
    proximo_servico_em: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="OPERACIONAL")

class OrdemManutencao(Base, TimestampMixin, TenantMixin):
    __tablename__ = 'ordens_manutencao'
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    maquinario_id: Mapped[UUID] = mapped_column(ForeignKey('maquinarios.id'))
    tipo: Mapped[str] = mapped_column(String(50))
    descricao: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    horimetro_na_abertura: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="PENDENTE")
    prioridade: Mapped[str] = mapped_column(String(50), default="MEDIA")
    concluida_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    custo_estimado: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    custo_real: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    maquinario: Mapped["Maquinario"] = relationship()
