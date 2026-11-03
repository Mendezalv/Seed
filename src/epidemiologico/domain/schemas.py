from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class OcorrenciaSanitariaBase(BaseModel):
    talhao_id: UUID | None = None
    tipo_cultura: str
    categoria: str
    agente_identificado: str
    severidade: str
    latitude: float = Field(ge=-33.0, le=5.0)
    longitude: float = Field(ge=-74.0, le=-35.0)
    fotos_urls: list[str] | None = None
    dados_extras: dict | None = None
    reportado_por: UUID
    observado_em: datetime
    origem: str
    sync_id: UUID | None = None

class OcorrenciaSanitariaCreate(OcorrenciaSanitariaBase):
    pass

class OcorrenciaSanitariaResponse(OcorrenciaSanitariaBase):
    id: UUID
    propriedade_id: UUID
    sincronizado_em: datetime | None = None
    model_config = ConfigDict(from_attributes=True)

class DadosClimaticosBase(BaseModel):
    latitude: float
    longitude: float
    data_referencia: date
    temp_media_c: float | None = None
    temp_max_c: float | None = None
    temp_min_c: float | None = None
    umidade_relativa_pct: float | None = None
    precipitacao_mm: float | None = None
    velocidade_vento_ms: float | None = None
    horas_molhamento_foliar: int | None = None
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
    valido_ate: datetime | None = None

class AlertaEpidemiologicoResponse(AlertaEpidemiologicoBase):
    id: UUID
    propriedade_id: UUID
    model_config = ConfigDict(from_attributes=True)

class MapaCalorPontoResponse(BaseModel):
    latitude: float
    longitude: float
    intensidade: int
    peso_severidade: float
    agentes: list[str] = Field(default_factory=list)

class MapaCalorResponse(BaseModel):
    total_pontos: int
    total_ocorrencias: int
    pontos: list[MapaCalorPontoResponse]


class CopilotoConsultaRequest(BaseModel):
    pergunta: str
    cultura: str = "Soja"
    talhao_nome: str | None = None
    insumos_estoque: list[str] | None = None
