from uuid import UUID
from datetime import datetime, date
from sqlalchemy import String, Float, Integer, Date, DateTime, JSON, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from src.shared.database.base import Base, TimestampMixin, TenantMixin, generate_uuid7

class OcorrenciaSanitaria(Base, TimestampMixin, TenantMixin):
    __tablename__ = 'ocorrencias_sanitarias'
    id: Mapped[UUID] = mapped_column(primary_key=True, default=generate_uuid7)
    talhao_id: Mapped[UUID | None] = mapped_column(ForeignKey('talhoes.id'), nullable=True)
    tipo_cultura: Mapped[str] = mapped_column(String(100))
    categoria: Mapped[str] = mapped_column(String(50)) # PRAGA|DOENCA|DEFICIENCIA
    agente_identificado: Mapped[str] = mapped_column(String(255))
    severidade: Mapped[str] = mapped_column(String(50)) # BAIXA|MEDIA|ALTA|CRITICA
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    fotos_urls: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    dados_extras: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    reportado_por: Mapped[UUID] = mapped_column(ForeignKey('usuarios.id', name='fk_ocorrencia_usuario'))
    observado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    sincronizado_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    origem: Mapped[str] = mapped_column(String(50)) # APP_CAMPO|WEB|SENSOR|API_EXTERNA
    sync_id: Mapped[UUID | None] = mapped_column(unique=True, nullable=True)

class DadosClimaticoCache(Base):
    __tablename__ = 'dados_climaticos_cache'
    id: Mapped[UUID] = mapped_column(primary_key=True, default=generate_uuid7)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    data_referencia: Mapped[date] = mapped_column(Date)
    temp_media_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    temp_max_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    temp_min_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    umidade_relativa_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    precipitacao_mm: Mapped[float | None] = mapped_column(Float, nullable=True)
    velocidade_vento_ms: Mapped[float | None] = mapped_column(Float, nullable=True)
    horas_molhamento_foliar: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fonte: Mapped[str] = mapped_column(String(50)) # INMET|CPTEC|OPENWEATHER

    __table_args__ = (
        UniqueConstraint('latitude', 'longitude', 'data_referencia', 'fonte', name='uix_dados_climaticos_cache'),
    )

class AlertaEpidemiologico(Base, TimestampMixin, TenantMixin):
    __tablename__ = 'alertas_epidemiologicos'
    id: Mapped[UUID] = mapped_column(primary_key=True, default=generate_uuid7)
    tipo_alerta: Mapped[str] = mapped_column(String(50)) # SURTO|RISCO_ELEVADO|PREVENTIVO
    agente: Mapped[str] = mapped_column(String(255))
    risco_score: Mapped[float] = mapped_column(Float) # 0.0 to 1.0
    fatores_contribuintes: Mapped[dict] = mapped_column(JSON)
    latitude_centro: Mapped[float] = mapped_column(Float)
    longitude_centro: Mapped[float] = mapped_column(Float)
    raio_km: Mapped[float] = mapped_column(Float)
    notificado: Mapped[bool] = mapped_column(Boolean, default=False)
    valido_ate: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
