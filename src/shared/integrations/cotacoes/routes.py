"""
Rotas da API de Cotações de Commodities e Moedas em Tempo Real.
"""

from typing import Any
from fastapi import APIRouter, Query

from src.shared.integrations.cotacoes.service import cotacoes_service

router = APIRouter(prefix="/cotacoes", tags=["Cotações & Mercado"])


@router.get(
    "/",
    summary="Lista cotações em tempo real de commodities agrícolas e moedas",
)
async def listar_cotacoes(
    forcar_atualizacao: bool = Query(False, description="Força recálculo desconsiderando o cache"),
) -> list[dict[str, Any]]:
    """Retorna as cotações oficiais e telemetria de mercado do CEPEA, B3 e Banco Central."""
    return await cotacoes_service.obter_cotacoes_em_tempo_real(forcar_atualizacao=forcar_atualizacao)


@router.post(
    "/simular",
    summary="Simula nova rodada de pregão em tempo real e transmite via WebSocket",
)
async def simular_pregao(
    volatilidade: float = Query(0.015, ge=0.001, le=0.10, description="Índice de volatilidade"),
) -> dict[str, Any]:
    """
    Executa uma rodada do pregão simulado, atualiza o cache Redis
    e transmite os novos dados via WebSocket para todos os usuários conectados.
    """
    novas_cotacoes = await cotacoes_service.simular_flutuacao_mercado(volatilidade=volatilidade)
    return {
        "status": "success",
        "mensagem": "Pregão simulado e transmitido via WebSocket com sucesso.",
        "cotacoes": novas_cotacoes,
    }


@router.get(
    "/historico/{codigo}",
    summary="Obtém série histórica dos últimos dias para uma commodity",
)
async def obter_historico_commodity(
    codigo: str,
    dias: int = Query(7, ge=3, le=60, description="Número de dias históricos"),
) -> dict[str, Any]:
    """Retorna curva de preços e volume negociado nos últimos dias."""
    historico = await cotacoes_service.obter_historico(commodity_codigo=codigo, dias=dias)
    return {
        "codigo": codigo.upper(),
        "dias": dias,
        "pontos": historico,
    }


@router.get(
    "/resumo-executivo",
    summary="Resumo simplificado de cotações para o ticker executivo da Topbar",
)
async def obter_resumo_ticker() -> list[dict[str, Any]]:
    """Retorna formato reduzido pronto para renderização no TickerBar."""
    cotacoes = await cotacoes_service.obter_cotacoes_em_tempo_real()
    return [
        {
            "codigo": c["codigo"],
            "nome": c["nome"],
            "preco": c["preco"],
            "variacao_pct": c["variacao_pct"],
            "tendencia": c["tendencia"],
            "unidade": c["unidade"],
        }
        for c in cotacoes
    ]
