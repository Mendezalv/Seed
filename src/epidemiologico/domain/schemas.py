from uuid import UUID
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class OcorrenciaSanitariaBase(BaseModel):
    talhao_id: Optional[UUID] = None
    tipo_cultura: str
    categoria: str
    agente_identificado: str
    severidade: str
    latitude: float = Field(ge=-33.0, le=5.0)
    longitude: float = Field(ge=-74.0, le=-35.0)
    fotos_urls: Optional[List[str]] = None
    dados_extras: Optional[dict] = None
    reportado_por: UUID
    observado_em: datetime
    origem: str
    sync_id: Optional[UUID] = None

class OcorrenciaSanitariaCreate(OcorrenciaSanitariaBase):
    pass

class OcorrenciaSanitariaResponse(OcorrenciaSanitariaBase):
    id: UUID
    propriedade_id: UUID
    sincronizado_em: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DadosClimaticosBase(BaseModel):
    latitude: float
    longitude: float
    data_referencia: date
    temp_media_c: Optional[float] = None
    temp_max_c: Optional[float] = None
    temp_min_c: Optional[float] = None
    umidade_relativa_pct: Optional[float] = None
    precipitacao_mm: Optional[float] = None
    velocidade_vento_ms: Optional[float] = None
    horas_molhamento_foliar: Optional[int] = None
    fonte: str

class DadosClimaticosResponse(DadosClimaticosBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class AlertaEpidemiologicoBase(BaseModel):
    tipo_alerta: str
    agente: str
    risco_score: float = Field(ge=0.0, le=1.0)
    fatores_contribuintes: dict
    latitude_centro: float
    longitude_centro: float
    raio_km: float
    notificado: bool = False
    valido_ate: Optional[datetime] = None

class AlertaEpidemiologicoResponse(AlertaEpidemiologicoBase):
    id: UUID
    propriedade_id: UUID
    model_config = ConfigDict(from_attributes=True)
