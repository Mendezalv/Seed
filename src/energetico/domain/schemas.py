from uuid import UUID
from datetime import date
from decimal import Decimal
from typing import Optional, Dict
from pydantic import BaseModel, ConfigDict, Field

class FonteEnergiaBase(BaseModel):
    tipo: str
    categoria: str
    unidade_medida: str
    fator_emissao_co2: float
    descricao: Optional[str] = None

class FonteEnergiaResponse(FonteEnergiaBase):
    id: UUID
    propriedade_id: UUID
    model_config = ConfigDict(from_attributes=True)


class ConsumoEnergiaBase(BaseModel):
    fonte_id: UUID
    periodo_inicio: date
    periodo_fim: date
    quantidade_consumida: Decimal = Field(gt=0)
    custo_total_brl: Optional[Decimal] = Field(None, ge=0)
    equipamento_ref: Optional[str] = None
    metadata_consumo: Optional[dict] = None
    sync_id: Optional[UUID] = None

class ConsumoEnergiaCreate(ConsumoEnergiaBase):
    pass

class ConsumoEnergiaResponse(ConsumoEnergiaBase):
    id: UUID
    propriedade_id: UUID
    model_config = ConfigDict(from_attributes=True)


class RelatorioESGBase(BaseModel):
    periodo: str
    emissao_total_co2e_ton: Decimal
    emissao_por_hectare: Decimal
    pct_energia_renovavel: Decimal
    intensidade_carbono: Optional[Decimal] = None
    indicadores_detalhados: dict
    status: str = "RASCUNHO"

class RelatorioESGResponse(RelatorioESGBase):
    id: UUID
    propriedade_id: UUID
    model_config = ConfigDict(from_attributes=True)


class MatrizEnergeticaResponse(BaseModel):
    total_kwh: float
    percentual_renovavel: float
    percentual_fossil: float
    breakdown_fontes: Dict[str, float]
