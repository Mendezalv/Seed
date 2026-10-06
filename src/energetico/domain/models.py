from uuid import UUID
from datetime import date
from decimal import Decimal
from sqlalchemy import String, Date, Float, Numeric, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from uuid_utils import uuid7

from src.shared.database.base import Base, TimestampMixin, TenantMixin

class FonteEnergia(Base, TimestampMixin, TenantMixin):
    __tablename__ = 'fontes_energia'
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    tipo: Mapped[str] = mapped_column(String(50)) # DIESEL|GASOLINA|ETANOL|SOLAR|BIOMASSA|EOLICA|REDE_ELETRICA
    categoria: Mapped[str] = mapped_column(String(50)) # FOSSIL|RENOVAVEL
    unidade_medida: Mapped[str] = mapped_column(String(20)) # litros|kWh|kg|m3
    fator_emissao_co2: Mapped[float] = mapped_column(Float) # kgCO2e per unit
    descricao: Mapped[str | None] = mapped_column(String(255), nullable=True)

class ConsumoEnergia(Base, TimestampMixin, TenantMixin):
    __tablename__ = 'consumos_energia'
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    fonte_id: Mapped[UUID] = mapped_column(ForeignKey('fontes_energia.id'))
    periodo_inicio: Mapped[date] = mapped_column(Date)
    periodo_fim: Mapped[date] = mapped_column(Date)
    quantidade_consumida: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    custo_total_brl: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    equipamento_ref: Mapped[str | None] = mapped_column(String(100), nullable=True)
    metadata_consumo: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    sync_id: Mapped[UUID | None] = mapped_column(unique=True, nullable=True)

class RelatorioESG(Base, TimestampMixin, TenantMixin):
    __tablename__ = 'relatorios_esg'
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    periodo: Mapped[str] = mapped_column(String(20))
    emissao_total_co2e_ton: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    emissao_por_hectare: Mapped[Decimal] = mapped_column(Numeric(10, 3))
    pct_energia_renovavel: Mapped[Decimal] = mapped_column(Numeric(5, 2))
    intensidade_carbono: Mapped[Decimal | None] = mapped_column(Numeric(10, 3), nullable=True)
    indicadores_detalhados: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(50), default="RASCUNHO") # RASCUNHO|PUBLICADO
