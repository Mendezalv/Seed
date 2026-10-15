"""
Rotas REST e WebSocket para Notificações e Alertas em Tempo Real da Plataforma Seed.
"""

import json
import logging
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.auth.dependencies import get_current_tenant
from src.shared.auth.jwt import decode_token
from src.shared.database.session import get_session
from src.shared.notifications.schemas import (
    NotificacaoListResponse,
    NotificacaoResponse,
    NotificacaoSimuladaRequest,
)
from src.shared.notifications.service import NotificacaoService
from src.shared.websocket.manager import ws_manager

logger = logging.getLogger("seed.notifications.routes")

router = APIRouter(tags=["Notificações"])


# ─── Endpoints REST ──────────────────────────────────────────────────────────


@router.get("/notificacoes", response_model=NotificacaoListResponse)
async def listar_notificacoes(
    apenas_nao_lidas: bool = Query(False, description="Filtrar apenas alertas pendentes"),
    limit: int = Query(50, ge=1, le=200, description="Limite máximo de notificações"),
    propriedade_id: UUID = Depends(get_current_tenant),
    session: AsyncSession = Depends(get_session),
) -> NotificacaoListResponse:
    """Lista o histórico de notificações e alertas em tempo real da propriedade rural."""
    items, total, total_nao_lidas = await NotificacaoService.listar_notificacoes(
        session=session,
        propriedade_id=propriedade_id,
        apenas_nao_lidas=apenas_nao_lidas,
        limit=limit,
    )
    return NotificacaoListResponse(
        items=[NotificacaoResponse.model_validate(item) for item in items],
        total=total,
        total_nao_lidas=total_nao_lidas,
    )


@router.patch("/notificacoes/{notificacao_id}/lida", response_model=NotificacaoResponse)
async def marcar_notificacao_lida(
    notificacao_id: UUID,
    propriedade_id: UUID = Depends(get_current_tenant),
    session: AsyncSession = Depends(get_session),
) -> NotificacaoResponse:
    """Marca uma notificação individual como lida e propaga o status via WebSocket."""
    notif = await NotificacaoService.marcar_como_lida(
        session=session,
        notificacao_id=notificacao_id,
        propriedade_id=propriedade_id,
    )
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificação não encontrada na propriedade atual",
        )
    return NotificacaoResponse.model_validate(notif)


@router.post("/notificacoes/marcar-todas-lidas")
async def marcar_todas_notificacoes_lidas(
    propriedade_id: UUID = Depends(get_current_tenant),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Marca todas as notificações pendentes da fazenda como lidas."""
    count = await NotificacaoService.marcar_todas_como_lidas(
        session=session,
        propriedade_id=propriedade_id,
    )
    return {"status": "ok", "atualizadas": count}


@router.post("/notificacoes/simular", response_model=NotificacaoResponse)
async def disparar_notificacao_simulada(
    payload: NotificacaoSimuladaRequest,
    propriedade_id: UUID = Depends(get_current_tenant),
    session: AsyncSession = Depends(get_session),
) -> NotificacaoResponse:
    """
    Emite um alerta técnico em tempo real para fins de demonstração,
    testes operacionais e auditoria de campo.
    """
    notif = await NotificacaoService.criar_notificacao(
        session=session,
        propriedade_id=propriedade_id,
        tipo=payload.tipo,
        titulo=payload.titulo,
        mensagem=payload.mensagem,
        severidade=payload.severidade,
        link_acao=payload.link_acao,
        metadata_json=payload.metadata_json,
        broadcast=True,
    )
    return NotificacaoResponse.model_validate(notif)


# ─── Endpoint WebSocket com Autenticação Multi-tenant ────────────────────────


@router.websocket("/ws/notificacoes")
async def websocket_notificacoes(
    websocket: WebSocket,
    token: str | None = Query(None, description="Token JWT de autenticação do operador"),
) -> None:
    """
    Canal WebSocket bidirecional para recepção de notificações e alertas em tempo real.
    Garante o isolamento absoluto dos eventos por propriedade rural (multitenancy seguro).
    """
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Token não fornecido")
        return

    try:
        payload = decode_token(token)
        propriedade_id = payload.org
    except Exception as exc:
        logger.warning("Rejeitada conexão WebSocket com token inválido: %s", exc)
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Token inválido")
        return

    await ws_manager.connect(websocket, propriedade_id)

    # Envia handshake inicial confirmando conexão e tenant vinculado
    try:
        await websocket.send_json({
            "type": "CONNECTED",
            "propriedade_id": str(propriedade_id),
            "mensagem": "Conexão em tempo real Seed estabelecida com sucesso.",
        })

        # Loop de escuta para manter a conexão ativa (heartbeat / ping-pong)
        while True:
            text = await websocket.receive_text()
            try:
                msg = json.loads(text)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except json.JSONDecodeError:
                logger.debug("Mensagem WebSocket ignorada (formato inválido)")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, propriedade_id)
    except Exception as exc:
        logger.error("Erro inesperado no ciclo de vida do WebSocket %s: %s", propriedade_id, exc)
        ws_manager.disconnect(websocket, propriedade_id)
