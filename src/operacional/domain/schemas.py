from uuid import UUID
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

# Base schemas
class InsumoBase(BaseModel):
    tipo: str
    nome: str
    unidade_medida: str
    preco_unitario: Decimal

class InsumoCreate(InsumoBase):
    pass

class InsumoUpdate(BaseModel):
    tipo: Optional[str] = None
    nome: Optional[str] = None
    unidade_medida: Optional[str] = None
    preco_unitario: Optional[Decimal] = None

class InsumoResponse(InsumoBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


class LoteInsumoBase(BaseModel):
    insumo_id: UUID
    codigo_lote: str
    quantidade_inicial: Decimal = Field(gt=0)
    quantidade_atual: Decimal = Field(ge=0)
    data_validade: Optional[date] = None
    fornecedor: Optional[str] = None
    entrada_em: datetime

class LoteInsumoCreate(LoteInsumoBase):
    pass

class LoteInsumoUpdate(BaseModel):
    quantidade_atual: Optional[Decimal] = Field(None, ge=0)
    data_validade: Optional[date] = None
    fornecedor: Optional[str] = None

class LoteInsumoResponse(LoteInsumoBase):
    id: UUID
    propriedade_id: UUID
    model_config = ConfigDict(from_attributes=True)


class TalhaoBase(BaseModel):
    nome: str
    area_hectares: Decimal = Field(gt=0)
    cultura_atual: Optional[str] = None
    status: str = "ATIVO"

class TalhaoCreate(TalhaoBase):
    geometria: Optional[str] = None  # WKT representation if needed

class TalhaoUpdate(BaseModel):
    nome: Optional[str] = None
    area_hectares: Optional[Decimal] = Field(None, gt=0)
    cultura_atual: Optional[str] = None
    status: Optional[str] = None

class TalhaoResponse(TalhaoBase):
    id: UUID
    propriedade_id: UUID
    model_config = ConfigDict(from_attributes=True)


class SafraBase(BaseModel):
    talhao_id: UUID
    cultura: str
    variedade: Optional[str] = None
    data_plantio: date
    data_colheita: Optional[date] = None
    produtividade_estimada: Optional[Decimal] = Field(None, gt=0)
    produtividade_real: Optional[Decimal] = Field(None, ge=0)
    status: str = "PLANEJADA"

class SafraCreate(SafraBase):
    pass

class SafraUpdate(BaseModel):
    cultura: Optional[str] = None
    variedade: Optional[str] = None
    data_plantio: Optional[date] = None
    data_colheita: Optional[date] = None
    produtividade_estimada: Optional[Decimal] = Field(None, gt=0)
    produtividade_real: Optional[Decimal] = Field(None, ge=0)
    status: Optional[str] = None

class SafraResponse(SafraBase):
    id: UUID
    propriedade_id: UUID
    model_config = ConfigDict(from_attributes=True)


class AlocacaoInsumoBase(BaseModel):
    lote_insumo_id: UUID
    safra_id: UUID
    talhao_id: UUID
    quantidade: Decimal = Field(gt=0)
    area_hectares: Decimal = Field(gt=0)
    operador_id: UUID
    aplicado_em: datetime
    metadata_campo: Optional[dict] = None
    sync_id: Optional[UUID] = None

class AlocacaoInsumoCreate(AlocacaoInsumoBase):
    pass

class AlocacaoInsumoUpdate(BaseModel):
    metadata_campo: Optional[dict] = None

class AlocacaoInsumoResponse(AlocacaoInsumoBase):
    id: UUID
    propriedade_id: UUID
    model_config = ConfigDict(from_attributes=True)


class MaquinarioBase(BaseModel):
    nome: str
    tipo: str
    modelo: Optional[str] = None
    ano_fabricacao: Optional[int] = None
    horimetro_atual: Decimal = Field(default=Decimal('0'), ge=0)
    intervalo_preventiva: Decimal = Field(default=Decimal('500'), gt=0)
    proximo_servico_em: Optional[Decimal] = None
    status: str = "OPERACIONAL"

class MaquinarioCreate(MaquinarioBase):
    pass

class MaquinarioUpdate(BaseModel):
    nome: Optional[str] = None
    tipo: Optional[str] = None
    horimetro_atual: Optional[Decimal] = Field(None, ge=0)
    proximo_servico_em: Optional[Decimal] = Field(None, ge=0)
    status: Optional[str] = None

class MaquinarioResponse(MaquinarioBase):
    id: UUID
    propriedade_id: UUID
    model_config = ConfigDict(from_attributes=True)


class OrdemManutencaoBase(BaseModel):
    maquinario_id: UUID
    tipo: str
    descricao: Optional[str] = None
    horimetro_na_abertura: Optional[Decimal] = Field(None, ge=0)
    status: str = "PENDENTE"
    prioridade: str = "MEDIA"
    concluida_em: Optional[datetime] = None
    custo_estimado: Optional[Decimal] = Field(None, ge=0)
    custo_real: Optional[Decimal] = Field(None, ge=0)

class OrdemManutencaoCreate(OrdemManutencaoBase):
    pass

class OrdemManutencaoUpdate(BaseModel):
    status: Optional[str] = None
    concluida_em: Optional[datetime] = None
    custo_real: Optional[Decimal] = Field(None, ge=0)

class OrdemManutencaoResponse(OrdemManutencaoBase):
    id: UUID
    propriedade_id: UUID
    model_config = ConfigDict(from_attributes=True)


class CenarioViabilidade(BaseModel):
    nome: str
    preco_saca: Decimal
    receita_bruta: Decimal
    lucro_liquido: Decimal
    margem_percentual: Decimal

class ViabilidadeRequest(BaseModel):
    safra_id: UUID
    custo_mao_obra: Decimal = Field(default=Decimal('0'), ge=0)
    custo_frete: Decimal = Field(default=Decimal('0'), ge=0)
    custo_impostos: Decimal = Field(default=Decimal('0'), ge=0)
    preco_mercado_saca: Optional[Decimal] = Field(None, gt=0)

class ViabilidadeResponse(BaseModel):
    custo_total: Decimal
    custo_por_saca: Decimal
    break_even_sacas: Decimal
    margem_percentual: Decimal
    receita_bruta: Decimal
    lucro_liquido: Decimal
    cenarios: List[CenarioViabilidade]
