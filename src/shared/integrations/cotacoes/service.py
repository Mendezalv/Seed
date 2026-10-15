"""
Serviço de Cotações de Commodities e Moedas em Tempo Real com Caching Redis e Broadcast WebSocket.
"""

from datetime import UTC, datetime, timedelta
import random
from typing import Any

from src.shared.cache import cache_manager
from src.shared.websocket import ws_manager

CACHE_KEY_COTACOES = "cotacoes:commodities:realtime"
CACHE_KEY_HISTORICO_PREFIX = "cotacoes:historico:"

BASE_COMMODITIES = [
    {
        "codigo": "SOJA",
        "nome": "Soja Paranaguá",
        "unidade": "R$/sc 60kg",
        "preco_base": 138.40,
        "mercado": "CEPEA / ESALQ",
    },
    {
        "codigo": "MILHO",
        "nome": "Milho Campinas",
        "unidade": "R$/sc 60kg",
        "preco_base": 59.20,
        "mercado": "CEPEA / B3",
    },
    {
        "codigo": "BOI",
        "nome": "Boi Gordo SP",
        "unidade": "R$/@",
        "preco_base": 242.50,
        "mercado": "B3 / CEPEA",
    },
    {
        "codigo": "CAFE",
        "nome": "Café Arábica Tipo 6",
        "unidade": "R$/sc 60kg",
        "preco_base": 1150.00,
        "mercado": "CEPEA",
    },
    {
        "codigo": "DOLAR",
        "nome": "Dólar Comercial",
        "unidade": "R$",
        "preco_base": 5.42,
        "mercado": "Banco Central / PTAX",
    },
]


class CotacoesService:
    """Motor de cotações agropecuárias com persistência em Redis e streaming WebSocket."""

    def __init__(self) -> None:
        pass

    async def obter_cotacoes_em_tempo_real(self, forcar_atualizacao: bool = False) -> list[dict[str, Any]]:
        """
        Retorna as cotações mais recentes do cache Redis.
        Se não estiverem em cache ou se forçado, inicializa a tabela base.
        """
        if not forcar_atualizacao:
            cached = await cache_manager.get_json(CACHE_KEY_COTACOES)
            if cached and isinstance(cached, list) and len(cached) > 0:
                return cached

        # Inicializa valores base de abertura de pregão
        cotacoes: list[dict[str, Any]] = []
        agora = datetime.now(UTC).isoformat()

        for base in BASE_COMMODITIES:
            preco_base = base["preco_base"]
            variacao = round(random.uniform(-0.8, 1.2), 2)
            preco_atual = round(preco_base * (1 + variacao / 100.0), 2)
            minima = round(min(preco_base, preco_atual) * 0.992, 2)
            maxima = round(max(preco_base, preco_atual) * 1.008, 2)

            cotacoes.append({
                "codigo": base["codigo"],
                "nome": base["nome"],
                "unidade": base["unidade"],
                "mercado": base["mercado"],
                "preco": preco_atual,
                "preco_anterior": preco_base,
                "variacao_pct": variacao,
                "tendencia": "UP" if variacao > 0 else ("DOWN" if variacao < 0 else "EQUAL"),
                "minima_dia": minima,
                "maxima_dia": maxima,
                "volume_contratos": random.randint(1200, 18500),
                "atualizado_em": agora,
            })

        await cache_manager.set_json(CACHE_KEY_COTACOES, cotacoes, ttl=3600)
        return cotacoes

    async def simular_flutuacao_mercado(self, volatilidade: float = 0.015) -> list[dict[str, Any]]:
        """
        Simula uma nova rodada de negócios no pregão, atualiza máximas e mínimas,
        persiste a nova cotação no Redis e dispara notificação WebSocket em tempo real.
        """
        cotacoes_atuais = await self.obter_cotacoes_em_tempo_real()
        novas_cotacoes: list[dict[str, Any]] = []
        agora = datetime.now(UTC).isoformat()

        for item in cotacoes_atuais:
            preco_antigo = item["preco"]
            # Flutuação randômica realista de mercado financeiro
            delta_pct = random.uniform(-volatilidade, volatilidade)
            novo_preco = round(preco_antigo * (1 + delta_pct), 2)

            # Recalcula variação em relação ao preço base do dia
            preco_base = item.get("preco_anterior", preco_antigo)
            variacao_total = round(((novo_preco - preco_base) / preco_base) * 100.0, 2)

            minima = min(item.get("minima_dia", novo_preco), novo_preco)
            maxima = max(item.get("maxima_dia", novo_preco), novo_preco)
            novo_volume = item.get("volume_contratos", 1000) + random.randint(50, 400)

            tendencia = "UP" if novo_preco > preco_antigo else ("DOWN" if novo_preco < preco_antigo else "EQUAL")

            novas_cotacoes.append({
                "codigo": item["codigo"],
                "nome": item["nome"],
                "unidade": item["unidade"],
                "mercado": item["mercado"],
                "preco": novo_preco,
                "preco_anterior": preco_antigo,
                "variacao_pct": variacao_total,
                "tendencia": tendencia,
                "minima_dia": minima,
                "maxima_dia": maxima,
                "volume_contratos": novo_volume,
                "atualizado_em": agora,
            })

        # Atualiza o cache Redis
        await cache_manager.set_json(CACHE_KEY_COTACOES, novas_cotacoes, ttl=3600)

        # Transmite via WebSocket em tempo real para todos os terminais conectados
        await ws_manager.broadcast_all({
            "type": "COTACOES_UPDATE",
            "data": novas_cotacoes,
            "timestamp": agora,
        })

        return novas_cotacoes

    async def obter_historico(self, commodity_codigo: str, dias: int = 7) -> list[dict[str, Any]]:
        """
        Retorna a série histórica dos últimos 'dias' dias para a commodity informada.
        """
        codigo_upper = commodity_codigo.upper()
        base_target = next((c for c in BASE_COMMODITIES if c["codigo"] == codigo_upper), BASE_COMMODITIES[0])

        cache_key = f"{CACHE_KEY_HISTORICO_PREFIX}{codigo_upper}:{dias}"
        cached = await cache_manager.get_json(cache_key)
        if cached:
            return cached

        hoje = datetime.now(UTC).date()
        historico: list[dict[str, Any]] = []
        preco_corrente = base_target["preco_base"]

        # Gera curva histórica consistente
        for i in range(dias, 0, -1):
            data_ponto = (hoje - timedelta(days=i)).isoformat()
            variacao_dia = round(random.uniform(-1.5, 1.8), 2)
            preco_ponto = round(preco_corrente * (1 + variacao_dia / 100.0), 2)
            historico.append({
                "data": data_ponto,
                "preco": preco_ponto,
                "variacao_pct": variacao_dia,
                "volume": random.randint(3000, 22000),
            })
            preco_corrente = preco_ponto

        await cache_manager.set_json(cache_key, historico, ttl=1800)
        return historico


# Singleton do serviço de cotações
cotacoes_service = CotacoesService()
