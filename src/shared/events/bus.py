import asyncio
import uuid
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Callable, Any, Awaitable

@dataclass
class DomainEvent:
    """
    Classe base para todos os eventos de domínio.
    """
    event_id: uuid.UUID = field(default_factory=uuid.uuid4)
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    event_type: str = field(default="DomainEvent")

@dataclass
class InsumoEstoqueBaixo(DomainEvent):
    event_type: str = field(default="InsumoEstoqueBaixo")
    insumo_id: uuid.UUID = field(default_factory=uuid.uuid4)
    propriedade_id: uuid.UUID = field(default_factory=uuid.uuid4)
    quantidade_atual: float = 0.0

@dataclass
class ManutencaoPendenteGerada(DomainEvent):
    event_type: str = field(default="ManutencaoPendenteGerada")
    equipamento_id: uuid.UUID = field(default_factory=uuid.uuid4)
    propriedade_id: uuid.UUID = field(default_factory=uuid.uuid4)

@dataclass
class AlertaEpidemiologicoGerado(DomainEvent):
    event_type: str = field(default="AlertaEpidemiologicoGerado")
    alerta_id: uuid.UUID = field(default_factory=uuid.uuid4)
    propriedade_id: uuid.UUID = field(default_factory=uuid.uuid4)
    nivel_risco: str = "BAIXO"

@dataclass
class RelatorioESGGerado(DomainEvent):
    event_type: str = field(default="RelatorioESGGerado")
    relatorio_id: uuid.UUID = field(default_factory=uuid.uuid4)
    propriedade_id: uuid.UUID = field(default_factory=uuid.uuid4)

class EventBus:
    """
    Barramento de eventos simples, em memória, processado de forma assíncrona.
    """
    def __init__(self):
        self._subscribers: dict[str, list[Callable[[DomainEvent], Awaitable[None]]]] = defaultdict(list)

    def subscribe(self, event_type: str, handler: Callable[[DomainEvent], Awaitable[None]]) -> None:
        """
        Inscreve um manipulador assíncrono para um tipo específico de evento.
        """
        self._subscribers[event_type].append(handler)

    async def publish(self, event: DomainEvent) -> None:
        """
        Publica um evento, acionando todos os manipuladores inscritos para aquele tipo.
        """
        handlers = self._subscribers.get(event.event_type, [])
        tasks = [asyncio.create_task(handler(event)) for handler in handlers]
        if tasks:
            await asyncio.gather(*tasks)

event_bus = EventBus()
