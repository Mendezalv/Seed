from uuid import UUID
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class ResumoPropriedadeGeral(BaseModel):
    propriedade_id: UUID
    nome: str
    municipio: Optional[str] = None
    estado: Optional[str] = None
    area_total_hectares: float = 0.0
    area_talhoes_hectares: float = 0.0
    total_talhoes: int = 0
    safras_ativas: int = 0
    culturas_em_campo: List[str] = Field(default_factory=list)

class ResumoOperacionalFinanceiro(BaseModel):
    custo_insumos_alocados_brl: float = 0.0
    total_lotes_estoque: int = 0
    lotes_estoque_baixo: int = 0
    total_maquinarios: int = 0
    maquinas_operacionais: int = 0
    maquinas_em_manutencao: int = 0
    ordens_manutencao_pendentes: int = 0
    custo_total_manutencao_brl: float = 0.0

class AgenteResumo(BaseModel):
    agente: str
    ocorrencias: int
    severidade_max: str

class ResumoEpidemiologico(BaseModel):
    nivel_risco_global: str = "BAIXO"  # BAIXO, MODERADO, ALTO, CRITICO
    score_risco_maximo: float = 0.0
    alertas_ativos: int = 0
    ocorrencias_recentes_30d: int = 0
    principais_agentes: List[AgenteResumo] = Field(default_factory=list)

class ResumoSustentabilidadeESG(BaseModel):
    emissao_recente_tco2e: Optional[float] = None
    emissao_por_hectare: Optional[float] = None
    pct_energia_renovavel: Optional[float] = None
    elegivel_credito_verde: bool = False
    ultimo_relatorio_periodo: Optional[str] = None
    ultimo_relatorio_status: Optional[str] = None

class ResumoClimaRecente(BaseModel):
    temperatura_c: Optional[float] = None
    umidade_relativa_pct: Optional[float] = None
    precipitacao_mm: Optional[float] = None
    data_referencia: Optional[str] = None
    fonte: Optional[str] = None

class DashboardConsolidadoResponse(BaseModel):
    propriedade: ResumoPropriedadeGeral
    operacional: ResumoOperacionalFinanceiro
    epidemiologico: ResumoEpidemiologico
    sustentabilidade: ResumoSustentabilidadeESG
    clima: Optional[ResumoClimaRecente] = None
    gerado_em: datetime
