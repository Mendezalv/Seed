"""
Gerenciador Unificado de Cache Redis com Fallback em Memória para a Plataforma Seed.

Fornece armazenamento de chave-valor com suporte a TTL, serialização JSON automática,
métricas de acerto (cache hit/miss) e resiliência com fallback transparente em memória
caso o servidor Redis esteja indisponível ou em ambientes de testes locais.
"""

import json
import logging
import time
from typing import Any

import redis.asyncio as aioredis

from src.shared.config import get_settings

logger = logging.getLogger("seed.cache")


class RedisCacheManager:
    """Gerenciador assíncrono de cache com conexão Redis e fallback em memória."""

    def __init__(self, redis_url: str | None = None) -> None:
        self.settings = get_settings()
        self.redis_url = redis_url or self.settings.REDIS_URL
        self._redis: aioredis.Redis | None = None
        self._memory_cache: dict[str, tuple[Any, float]] = {}
        self._hits = 0
        self._misses = 0
        self._is_redis_available: bool | None = None

    async def _get_client(self) -> aioredis.Redis | None:
        """Inicializa ou retorna o cliente Redis assíncrono."""
        if self._redis is not None:
            return self._redis
        if self._is_redis_available is False:
            return None

        try:
            client = aioredis.from_url(
                self.redis_url,
                decode_responses=True,
                socket_timeout=1.5,
                socket_connect_timeout=1.5,
            )
            # Testa conexão inicial
            await client.ping()
            self._redis = client
            self._is_redis_available = True
            logger.info("Conexão com Redis estabelecida com sucesso: %s", self.redis_url)
            return self._redis
        except Exception as exc:
            self._is_redis_available = False
            logger.debug(
                "Redis não disponível (%s). Utilizando fallback de cache em memória: %s",
                self.redis_url,
                exc,
            )
            return None

    def _get_memory(self, key: str) -> Any | None:
        """Recupera valor do cache em memória respeitando o tempo de expiração."""
        if key in self._memory_cache:
            val, expire_at = self._memory_cache[key]
            if time.time() < expire_at:
                return val
            # Expirado
            del self._memory_cache[key]
        return None

    def _set_memory(self, key: str, value: Any, ttl: int) -> None:
        """Armazena valor no cache em memória com timestamp de expiração."""
        self._memory_cache[key] = (value, time.time() + ttl)

    async def get(self, key: str) -> str | None:
        """Recupera uma string do cache."""
        client = await self._get_client()
        if client:
            try:
                val = await client.get(key)
                if val is not None:
                    self._hits += 1
                    return val
                self._misses += 1
                return None
            except Exception as exc:
                logger.debug("Falha ao ler do Redis (%s), recorrendo à memória", exc)

        # Fallback memória
        val = self._get_memory(key)
        if val is not None:
            self._hits += 1
            return str(val) if not isinstance(val, str) else val
        self._misses += 1
        return None

    async def set(self, key: str, value: str, ttl: int = 3600) -> bool:
        """Armazena uma string com tempo de vida (TTL) em segundos."""
        client = await self._get_client()
        if client:
            try:
                await client.set(key, value, ex=ttl)
                return True
            except Exception as exc:
                logger.debug("Falha ao gravar no Redis (%s), gravando em memória", exc)

        self._set_memory(key, value, ttl)
        return True

    async def get_json(self, key: str) -> Any | None:
        """Recupera e desserializa um objeto JSON do cache."""
        client = await self._get_client()
        if client:
            try:
                raw = await client.get(key)
                if raw is not None:
                    self._hits += 1
                    return json.loads(raw)
                self._misses += 1
                return None
            except Exception as exc:
                logger.debug("Falha get_json no Redis (%s), verificando memória", exc)

        val = self._get_memory(key)
        if val is not None:
            self._hits += 1
            return val
        self._misses += 1
        return None

    async def set_json(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Serializa e armazena qualquer objeto JSON com TTL em segundos."""
        serialized = json.dumps(value, ensure_ascii=False)
        client = await self._get_client()
        if client:
            try:
                await client.set(key, serialized, ex=ttl)
                return True
            except Exception as exc:
                logger.debug("Falha set_json no Redis (%s), armazenando em memória", exc)

        self._set_memory(key, value, ttl)
        return True

    async def delete(self, key: str) -> bool:
        """Remove uma chave específica do cache."""
        client = await self._get_client()
        if client:
            try:
                await client.delete(key)
            except Exception as exc:
                logger.debug("Falha ao deletar chave no Redis (%s): %s", key, exc)

        if key in self._memory_cache:
            del self._memory_cache[key]
            return True
        return False

    async def delete_pattern(self, pattern: str) -> int:
        """Remove todas as chaves correspondentes ao padrão (ex: 'clima:*')."""
        removed = 0
        client = await self._get_client()
        if client:
            try:
                keys = await client.keys(pattern)
                if keys:
                    removed = await client.delete(*keys)
            except Exception as exc:
                logger.debug("Falha ao deletar padrão no Redis (%s): %s", pattern, exc)

        # Limpeza memória
        # Converte padrão glob simples para match de prefixo
        prefix = pattern.rstrip("*")
        mem_keys = [k for k in self._memory_cache.keys() if k.startswith(prefix)]
        for k in mem_keys:
            del self._memory_cache[k]
            removed += 1

        return removed

    async def ping(self) -> bool:
        """Verifica se o serviço Redis está ativo e respondendo."""
        client = await self._get_client()
        if client:
            try:
                return bool(await client.ping())
            except Exception:
                return False
        return False

    async def get_stats(self) -> dict[str, Any]:
        """Retorna métricas operacionais do sistema de cache."""
        is_alive = await self.ping()
        total_reqs = self._hits + self._misses
        hit_ratio = (self._hits / total_reqs * 100) if total_reqs > 0 else 0.0

        return {
            "status": "connected" if is_alive else "memory_fallback",
            "backend": "redis" if is_alive else "memory_fallback",
            "provider": "Redis" if is_alive else "In-Memory (TTL)",
            "redis_url": self.redis_url,
            "hits": self._hits,
            "misses": self._misses,
            "total_requests": total_reqs,
            "hit_ratio_pct": round(hit_ratio, 2),
            "hit_ratio_percent": round(hit_ratio, 2),
            "memory_keys_count": len(self._memory_cache),
        }

    async def close(self) -> None:
        """Fecha a conexão com o pool do Redis."""
        if self._redis:
            await self._redis.aclose()
            self._redis = None


# Instância global singleton do cache
cache_manager = RedisCacheManager()
