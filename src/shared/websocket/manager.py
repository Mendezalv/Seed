"""
Gerenciador de Conexões WebSocket Multi-tenant para a Plataforma Seed.

Permite streaming de notificações e alertas em tempo real isolados por propriedade rural (tenant).
"""

import logging
from collections import defaultdict
from uuid import UUID

from fastapi import WebSocket

logger = logging.getLogger("seed.websocket")


class ConnectionManager:
    """Gerencia conexões ativas de WebSocket agrupadas por tenant (propriedade_id)."""

    def __init__(self) -> None:
        self._active_connections: dict[UUID, set[WebSocket]] = defaultdict(set)

    async def connect(self, websocket: WebSocket, propriedade_id: UUID) -> None:
        """Aceita a conexão e a vincula à propriedade rural do usuário."""
        await websocket.accept()
        self._active_connections[propriedade_id].add(websocket)
        logger.info(
            "WebSocket conectado para propriedade %s. Conexões ativas no tenant: %d",
            propriedade_id,
            len(self._active_connections[propriedade_id]),
        )

    def disconnect(self, websocket: WebSocket, propriedade_id: UUID) -> None:
        """Remove o WebSocket desconectado do grupo do tenant."""
        if propriedade_id in self._active_connections:
            self._active_connections[propriedade_id].discard(websocket)
            if not self._active_connections[propriedade_id]:
                del self._active_connections[propriedade_id]
        logger.info("WebSocket desconectado da propriedade %s", propriedade_id)

    async def broadcast_to_tenant(self, propriedade_id: UUID, data: dict) -> int:
        """
        Envia mensagem estruturada para todos os clientes conectados daquela propriedade rural.
        Remove sockets que apresentarem falha de envio.
        """
        connections = list(self._active_connections.get(propriedade_id, set()))
        if not connections:
            return 0

        sent_count = 0
        dead_connections: list[WebSocket] = []

        for ws in connections:
            try:
                await ws.send_json(data)
                sent_count += 1
            except Exception as exc:
                logger.warning(
                    "Falha ao enviar mensagem WebSocket para cliente na propriedade %s: %s",
                    propriedade_id,
                    exc,
                )
                dead_connections.append(ws)

        for dead_ws in dead_connections:
            self.disconnect(dead_ws, propriedade_id)

        return sent_count

    async def broadcast_all(self, data: dict) -> int:
        """Transmite mensagem global para todas as conexões ativas em todos os tenants."""
        total_sent = 0
        for prop_id in list(self._active_connections.keys()):
            total_sent += await self.broadcast_to_tenant(prop_id, data)
        return total_sent

    def count_connections(self, propriedade_id: UUID | None = None) -> int:
        """Retorna o número de conexões ativas por tenant ou no total do sistema."""
        if propriedade_id is not None:
            return len(self._active_connections.get(propriedade_id, set()))
        return sum(len(conns) for conns in self._active_connections.values())


# Instância singleton global do gerenciador de WebSockets
ws_manager = ConnectionManager()
