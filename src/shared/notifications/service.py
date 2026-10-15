"""
Serviço de Negócio para Gestão e Disparo de Notificações em Tempo Real.
"""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.database.models import Notificacao
from src.shared.websocket.manager import ws_manager


class NotificacaoService:
    """Regras de negócio para criação, consulta e marcação de notificações."""

    @staticmethod
    def _serializar_notificacao(notif: Notificacao) -> dict:
        """Converte a entidade Notificacao em payload de dicionário pronto para transmissão JSON."""
        return {
            "id": str(notif.id),
            "propriedade_id": str(notif.propriedade_id),
            "tipo": notif.tipo,
            "titulo": notif.titulo,
            "mensagem": notif.mensagem,
            "severidade": notif.severidade,
            "lida": notif.lida,
            "lida_em": notif.lida_em.isoformat() if notif.lida_em else None,
            "link_acao": notif.link_acao,
            "metadata_json": notif.metadata_json,
            "created_at": (
                notif.created_at.isoformat()
                if notif.created_at
                else datetime.now(UTC).isoformat()
            ),
        }

    @classmethod
    async def criar_notificacao(
        cls,
        session: AsyncSession,
        propriedade_id: UUID,
        tipo: str,
        titulo: str,
        mensagem: str,
        severidade: str = "INFO",
        link_acao: str | None = None,
        metadata_json: dict | None = None,
        broadcast: bool = True,
    ) -> Notificacao:
        """Cria e persiste uma notificação no banco de dados, transmitindo-a via WebSocket."""
        notificacao = Notificacao(
            propriedade_id=propriedade_id,
            tipo=tipo,
            titulo=titulo,
            mensagem=mensagem,
            severidade=severidade,
            lida=False,
            link_acao=link_acao,
            metadata_json=metadata_json,
        )
        session.add(notificacao)
        await session.commit()
        await session.refresh(notificacao)

        if broadcast:
            payload = {
                "type": "NOTIFICATION",
                "data": cls._serializar_notificacao(notificacao),
            }
            await ws_manager.broadcast_to_tenant(propriedade_id, payload)

        return notificacao

    @classmethod
    async def listar_notificacoes(
        cls,
        session: AsyncSession,
        propriedade_id: UUID,
        apenas_nao_lidas: bool = False,
        limit: int = 50,
    ) -> tuple[list[Notificacao], int, int]:
        """
        Retorna as notificações da propriedade ordenadas cronologicamente,
        além das métricas de total e total não lidas.
        """
        query = select(Notificacao).where(Notificacao.propriedade_id == propriedade_id)
        if apenas_nao_lidas:
            query = query.where(Notificacao.lida == False)  # noqa: E712

        query = query.order_by(Notificacao.created_at.desc()).limit(limit)
        result = await session.execute(query)
        items = list(result.scalars().all())

        # Contagem total
        total_stmt = select(func.count(Notificacao.id)).where(
            Notificacao.propriedade_id == propriedade_id
        )
        total_result = await session.execute(total_stmt)
        total = total_result.scalar_one() or 0

        # Contagem de não lidas
        unread_stmt = select(func.count(Notificacao.id)).where(
            Notificacao.propriedade_id == propriedade_id,
            Notificacao.lida == False,  # noqa: E712
        )
        unread_result = await session.execute(unread_stmt)
        total_nao_lidas = unread_result.scalar_one() or 0

        return items, total, total_nao_lidas

    @classmethod
    async def marcar_como_lida(
        cls,
        session: AsyncSession,
        notificacao_id: UUID,
        propriedade_id: UUID,
    ) -> Notificacao | None:
        """Marca uma notificação específica como lida e notifica os clientes conectados."""
        query = select(Notificacao).where(
            Notificacao.id == notificacao_id,
            Notificacao.propriedade_id == propriedade_id,
        )
        result = await session.execute(query)
        notificacao = result.scalar_one_or_none()

        if not notificacao:
            return None

        notificacao.lida = True
        notificacao.lida_em = datetime.now(UTC)
        await session.commit()
        await session.refresh(notificacao)

        await ws_manager.broadcast_to_tenant(
            propriedade_id,
            {"type": "NOTIFICATION_READ", "data": {"id": str(notificacao_id)}},
        )

        return notificacao

    @classmethod
    async def marcar_todas_como_lidas(
        cls,
        session: AsyncSession,
        propriedade_id: UUID,
    ) -> int:
        """Marca todas as notificações pendentes da propriedade como lidas."""
        now = datetime.now(UTC)
        stmt = (
            update(Notificacao)
            .where(
                Notificacao.propriedade_id == propriedade_id,
                Notificacao.lida == False,  # noqa: E712
            )
            .values(lida=True, lida_em=now)
        )
        result = await session.execute(stmt)
        await session.commit()

        await ws_manager.broadcast_to_tenant(
            propriedade_id,
            {"type": "ALL_NOTIFICATIONS_READ", "data": {"propriedade_id": str(propriedade_id)}},
        )

        return result.rowcount


def setup_notification_event_subscribers() -> None:
    """Inscreve manipuladores no barramento de eventos de domínio para alertas em tempo real."""
    from src.shared.events.bus import (
        AlertaEpidemiologicoGerado,
        DomainEvent,
        InsumoEstoqueBaixo,
        ManutencaoPendenteGerada,
        event_bus,
    )

    async def _handle_alerta_epidemiologico(event: DomainEvent) -> None:
        if isinstance(event, AlertaEpidemiologicoGerado):
            await ws_manager.broadcast_to_tenant(
                event.propriedade_id,
                {
                    "type": "NOTIFICATION",
                    "data": {
                        "tipo": "EPIDEMIOLOGICO",
                        "titulo": "Alerta Fitossanitário Detectado",
                        "mensagem": f"Risco {event.nivel_risco} identificado na lavoura.",
                        "severidade": (
                            "CRITICA"
                            if event.nivel_risco in ["CRITICA", "ALTA", "ALTO"]
                            else "ALTA"
                        ),
                        "link_acao": "/vigilancia",
                        "lida": False,
                        "created_at": event.timestamp.isoformat(),
                    },
                },
            )

    async def _handle_manutencao_pendente(event: DomainEvent) -> None:
        if isinstance(event, ManutencaoPendenteGerada):
            await ws_manager.broadcast_to_tenant(
                event.propriedade_id,
                {
                    "type": "NOTIFICATION",
                    "data": {
                        "tipo": "MANUTENCAO",
                        "titulo": "Manutenção Preventiva Pendente",
                        "mensagem": "Maquinário atingiu o intervalo de revisão programada.",
                        "severidade": "ALTA",
                        "link_acao": "/maquinarios",
                        "lida": False,
                        "created_at": event.timestamp.isoformat(),
                    },
                },
            )

    async def _handle_estoque_baixo(event: DomainEvent) -> None:
        if isinstance(event, InsumoEstoqueBaixo):
            await ws_manager.broadcast_to_tenant(
                event.propriedade_id,
                {
                    "type": "NOTIFICATION",
                    "data": {
                        "tipo": "ESTOQUE",
                        "titulo": "Estoque Baixo de Insumo",
                        "mensagem": f"Estoque crítico ({event.quantidade_atual:.1f} un).",
                        "severidade": "MEDIA",
                        "link_acao": "/insumos",
                        "lida": False,
                        "created_at": event.timestamp.isoformat(),
                    },
                },
            )

    event_bus.subscribe("AlertaEpidemiologicoGerado", _handle_alerta_epidemiologico)
    event_bus.subscribe("ManutencaoPendenteGerada", _handle_manutencao_pendente)
    event_bus.subscribe("InsumoEstoqueBaixo", _handle_estoque_baixo)


# Registra os manipuladores de eventos automaticamente ao inicializar
setup_notification_event_subscribers()
