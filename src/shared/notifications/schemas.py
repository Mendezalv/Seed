"""
Esquemas Pydantic para Notificações e Alertas em Tempo Real da Plataforma Seed.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NotificacaoResponse(BaseModel):
    """Representação serializada de uma notificação do sistema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    propriedade_id: UUID
    tipo: str = Field(description="EPIDEMIOLOGICO | MANUTENCAO | ESTOQUE | CLIMA | ESG | SISTEMA")
    titulo: str
    mensagem: str
    severidade: str = Field(default="INFO", description="CRITICA | ALTA | MEDIA | INFO")
    lida: bool = False
    lida_em: datetime | None = None
    link_acao: str | None = None
    metadata_json: dict | None = None
    created_at: datetime
    updated_at: datetime | None = None


class NotificacaoListResponse(BaseModel):
    """Lista paginada de notificações com contador de não lidas."""
    items: list[NotificacaoResponse]
    total: int
    total_nao_lidas: int


class NotificacaoSimuladaRequest(BaseModel):
    """Payload para emissão de notificação/alerta simulado em tempo real."""
    tipo: str = Field(default="EPIDEMIOLOGICO", description="Categoria do alerta")
    titulo: str = Field(description="Título objetivo do alerta")
    mensagem: str = Field(description="Corpo do alerta técnico")
    severidade: str = Field(default="CRITICA", description="CRITICA | ALTA | MEDIA | INFO")
    link_acao: str | None = Field(
        default="/vigilancia",
        description="Rota de destino ao clicar no alerta",
    )
    metadata_json: dict | None = None
