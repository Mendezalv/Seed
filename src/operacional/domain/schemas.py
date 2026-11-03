from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

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
    tipo: str | None = None
    nome: str | None = None
    unidade_medida: str | None = None
    preco_unitario: Decimal | None = None

class InsumoResponse(InsumoBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


class LoteInsumoBase(BaseModel):
    insumo_id: UUID
    codigo_lote: str
    quantidade_inicial: Decimal = Field(gt=0)
    quantidade_atual: Decimal = Field(ge=0)
    data_validade: date | None = None
    fornecedor: str | None = None
    entrada_em: datetime

class LoteInsumoCreate(LoteInsumoBase):
    pass

class LoteInsumoUpdate(BaseModel):
    quantidade_atual: Decimal | None = Field(None, ge=0)
    data_validade: date | None = None
    fornecedor: str | None = None

class LoteInsumoResponse(LoteInsumoBase):
    id: UUID
    propriedade_id: UUID
    model_config = ConfigDict(from_attributes=True)


class TalhaoBase(BaseModel):
    nome: str
    area_hectares: Decimal = Field(gt=0)
    cultura_atual: str | None = None
    status: str = "ATIVO"

class TalhaoCreate(TalhaoBase):
    geometria: str | None = None  # WKT representation if needed

class TalhaoUpdate(BaseModel):
    nome: str | None = None
    area_hectares: Decimal | None = Field(None, gt=0)
    cultura_atual: str | None = None
    status: str | None = None

class TalhaoResponse(TalhaoBase):
    id: UUID
    propriedade_id: UUID
    model_config = ConfigDict(from_attributes=True)


class SafraBase(BaseModel):
    talhao_id: UUID
    cultura: str
    variedade: str | None = None
    data_plantio: date
    data_colheita: date | None = None
    produtividade_estimada: Decimal | None = Field(None, gt=0)
    produtividade_real: Decimal | None = Field(None, ge=0)
    status: str = "PLANEJADA"

class SafraCreate(SafraBase):
    pass

class SafraUpdate(BaseModel):
    cultura: str | None = None
    variedade: str | None = None
    data_plantio: date | None = None
    data_colheita: date | None = None
    produtividade_estimada: Decimal | None = Field(None, gt=0)
    produtividade_real: Decimal | None = Field(None, ge=0)
    status: str | None = None

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
    metadata_campo: dict | None = None
    sync_id: UUID | None = None

class AlocacaoInsumoCreate(AlocacaoInsumoBase):
    pass

class AlocacaoInsumoUpdate(BaseModel):
    metadata_campo: dict | None = None

class AlocacaoInsumoResponse(AlocacaoInsumoBase):
    id: UUID
    propriedade_id: UUID
    model_config = ConfigDict(from_attributes=True)


class MaquinarioBase(BaseModel):
    nome: str
    tipo: str
    modelo: str | None = None
    ano_fabricacao: int | None = None
    horimetro_atual: Decimal = Field(default=Decimal('0'), ge=0)
    intervalo_preventiva: Decimal = Field(default=Decimal('500'), gt=0)
    proximo_servico_em: Decimal | None = None
    status: str = "OPERACIONAL"

class MaquinarioCreate(MaquinarioBase):
    pass

class MaquinarioUpdate(BaseModel):
    nome: str | None = None
    tipo: str | None = None
    horimetro_atual: Decimal | None = Field(None, ge=0)
    proximo_servico_em: Decimal | None = Field(None, ge=0)
    status: str | None = None

class MaquinarioResponse(MaquinarioBase):
    id: UUID
    propriedade_id: UUID
    model_config = ConfigDict(from_attributes=True)


class OrdemManutencaoBase(BaseModel):
    maquinario_id: UUID
    tipo: str
    descricao: str | None = None
    horimetro_na_abertura: Decimal | None = Field(None, ge=0)
    status: str = "PENDENTE"
    prioridade: str = "MEDIA"
    concluida_em: datetime | None = None
    custo_estimado: Decimal | None = Field(None, ge=0)
    custo_real: Decimal | None = Field(None, ge=0)

class OrdemManutencaoCreate(OrdemManutencaoBase):
    pass

class OrdemManutencaoUpdate(BaseModel):
    status: str | None = None
    concluida_em: datetime | None = None
    custo_real: Decimal | None = Field(None, ge=0)

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
    preco_mercado_saca: Decimal | None = Field(None, gt=0)

class ViabilidadeResponse(BaseModel):
    custo_total: Decimal
    custo_por_saca: Decimal
    break_even_sacas: Decimal
    margem_percentual: Decimal
    receita_bruta: Decimal
    lucro_liquido: Decimal
    cenarios: list[CenarioViabilidade]


# ─── NF-e Agro Schemas ────────────────────────────────────────
class NfeParseRequest(BaseModel):
    xml_content: str

class NfeItemImport(BaseModel):
    nome_produto: str
    categoria: str = "DEFENSIVO"
    unidade: str = "L"
    quantidade: Decimal = Field(gt=0)
    custo_unitario: Decimal = Field(ge=0)
    codigo_lote: str
    data_validade: date | None = None
    fornecedor: str | None = None

class NfeImportRequest(BaseModel):
    numero_nf: str
    chave_acesso: str | None = None
    fornecedor_padrao: str | None = None
    itens: list[NfeItemImport]

class NfeImportResponse(BaseModel):
    sucesso: bool
    total_itens_importados: int
    lotes_criados: list[LoteInsumoResponse]
    mensagem: str
