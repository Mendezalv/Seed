"""
Testes unitários para o sistema de Notificações e Gerenciador WebSocket da Plataforma Seed.
"""

from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.events.bus import (
    AlertaEpidemiologicoGerado,
    InsumoEstoqueBaixo,
    ManutencaoPendenteGerada,
    event_bus,
)
from src.shared.notifications.service import NotificacaoService
from src.shared.websocket.manager import ConnectionManager


@pytest.mark.asyncio
async def test_websocket_manager_connect_and_disconnect():
    manager = ConnectionManager()
    prop_id = uuid4()
    mock_ws = AsyncMock()

    await manager.connect(mock_ws, prop_id)
    assert manager.count_connections(prop_id) == 1
    assert manager.count_connections() == 1
    mock_ws.accept.assert_awaited_once()

    manager.disconnect(mock_ws, prop_id)
    assert manager.count_connections(prop_id) == 0
    assert manager.count_connections() == 0


@pytest.mark.asyncio
async def test_websocket_manager_broadcast():
    manager = ConnectionManager()
    prop1 = uuid4()
    prop2 = uuid4()

    ws1 = AsyncMock()
    ws2 = AsyncMock()
    ws3 = AsyncMock()

    await manager.connect(ws1, prop1)
    await manager.connect(ws2, prop1)
    await manager.connect(ws3, prop2)

    # Broadcast para tenant prop1
    payload = {"type": "NOTIFICATION", "titulo": "Teste"}
    sent = await manager.broadcast_to_tenant(prop1, payload)
    assert sent == 2
    ws1.send_json.assert_awaited_with(payload)
    ws2.send_json.assert_awaited_with(payload)
    ws3.send_json.assert_not_awaited()

    # Broadcast global
    all_sent = await manager.broadcast_all({"type": "GLOBAL"})
    assert all_sent == 3


@pytest.mark.asyncio
async def test_notificacao_service_crud_flow(session: AsyncSession):
    prop_id = uuid4()

    # 1. Cria Notificação
    notif = await NotificacaoService.criar_notificacao(
        session=session,
        propriedade_id=prop_id,
        tipo="EPIDEMIOLOGICO",
        titulo="Foco Crítico de Ferrugem",
        mensagem="Esporos detectados no Talhão 02",
        severidade="CRITICA",
        link_acao="/vigilancia",
        broadcast=False,
    )
    assert notif.id is not None
    assert notif.lida is False
    assert notif.titulo == "Foco Crítico de Ferrugem"

    # 2. Lista Notificações
    items, total, unread = await NotificacaoService.listar_notificacoes(
        session=session,
        propriedade_id=prop_id,
    )
    assert total == 1
    assert unread == 1
    assert len(items) == 1
    assert items[0].id == notif.id

    # 3. Marca individual como lida
    updated = await NotificacaoService.marcar_como_lida(
        session=session,
        notificacao_id=notif.id,
        propriedade_id=prop_id,
    )
    assert updated is not None
    assert updated.lida is True
    assert updated.lida_em is not None

    # Verifica contador de não lidas
    _, _, unread_after = await NotificacaoService.listar_notificacoes(
        session=session,
        propriedade_id=prop_id,
    )
    assert unread_after == 0

    # 4. Cria mais 2 notificações e marca todas como lidas
    await NotificacaoService.criar_notificacao(
        session=session,
        propriedade_id=prop_id,
        tipo="MANUTENCAO",
        titulo="Revisão Trator",
        mensagem="Horímetro limite",
        broadcast=False,
    )
    await NotificacaoService.criar_notificacao(
        session=session,
        propriedade_id=prop_id,
        tipo="ESTOQUE",
        titulo="Estoque Baixo",
        mensagem="Ureia no fim",
        broadcast=False,
    )

    _, _, unread_two = await NotificacaoService.listar_notificacoes(
        session=session,
        propriedade_id=prop_id,
    )
    assert unread_two == 2

    marcadas = await NotificacaoService.marcar_todas_como_lidas(session, prop_id)
    assert marcadas == 2

    _, _, unread_final = await NotificacaoService.listar_notificacoes(
        session=session,
        propriedade_id=prop_id,
    )
    assert unread_final == 0


@pytest.mark.asyncio
async def test_domain_events_trigger_notifications():
    prop_id = uuid4()

    # Evento Epidemiológico
    ev_epi = AlertaEpidemiologicoGerado(
        alerta_id=uuid4(),
        propriedade_id=prop_id,
        nivel_risco="CRITICA",
    )
    await event_bus.publish(ev_epi)

    # Evento Manutenção
    ev_manut = ManutencaoPendenteGerada(
        equipamento_id=uuid4(),
        propriedade_id=prop_id,
    )
    await event_bus.publish(ev_manut)

    # Evento Estoque
    ev_estoque = InsumoEstoqueBaixo(
        insumo_id=uuid4(),
        propriedade_id=prop_id,
        quantidade_atual=12.5,
    )
    await event_bus.publish(ev_estoque)
