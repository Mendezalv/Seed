import httpx
import structlog
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from typing import Any, Optional
import time

logger = structlog.get_logger()

class IntegrationError(Exception):
    """
    Exceção base para erros em integrações externas.
    """
    pass

class BaseAPIClient:
    """
    Cliente HTTP base para realizar requisições a APIs externas com retry e cache em memória.
    """
    def __init__(self, base_url: str, headers: Optional[dict[str, str]] = None, timeout: float = 10.0):
        self.base_url = base_url.rstrip("/")
        self.headers = headers or {}
        self.timeout = timeout
        self._cache: dict[str, dict[str, Any]] = {}

    def _get_cache_key(self, method: str, url: str, params: Optional[dict[str, Any]] = None) -> str:
        param_str = str(sorted(params.items())) if params else ""
        return f"{method}:{url}:{param_str}"

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.TimeoutException)),
        reraise=True
    )
    async def get(self, endpoint: str, params: Optional[dict[str, Any]] = None, cache_ttl: Optional[int] = None) -> dict[str, Any] | str | list[Any]:
        """
        Realiza requisição GET com tratamento de erro, retry e cache.
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        cache_key = self._get_cache_key("GET", url, params)

        if cache_ttl is not None:
            cached = self._cache.get(cache_key)
            if cached and (time.time() - cached["timestamp"]) < cache_ttl:
                logger.debug("Cache hit", url=url)
                return cached["data"]

        logger.info("Executando requisição GET", url=url, params=params)
        async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                content_type = response.headers.get("content-type", "")
                if "application/json" in content_type:
                    data = response.json()
                else:
                    data = response.text

                if cache_ttl is not None:
                    self._cache[cache_key] = {
                        "timestamp": time.time(),
                        "data": data
                    }

                return data
            except httpx.HTTPStatusError as e:
                logger.error("Erro HTTP", status_code=e.response.status_code, url=url)
                raise IntegrationError(f"Erro HTTP {e.response.status_code} em {url}") from e
            except Exception as e:
                logger.error("Erro de requisição", erro=str(e), url=url)
                raise IntegrationError(f"Falha ao conectar à API {url}") from e

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.TimeoutException)),
        reraise=True
    )
    async def post(self, endpoint: str, json_data: Optional[dict[str, Any]] = None) -> dict[str, Any] | str:
        """
        Realiza requisição POST com tratamento de erro e retry.
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        logger.info("Executando requisição POST", url=url)
        async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers) as client:
            try:
                response = await client.post(url, json=json_data)
                response.raise_for_status()
                
                content_type = response.headers.get("content-type", "")
                if "application/json" in content_type:
                    return response.json()
                return response.text
            except httpx.HTTPStatusError as e:
                logger.error("Erro HTTP", status_code=e.response.status_code, url=url)
                raise IntegrationError(f"Erro HTTP {e.response.status_code} em {url}") from e
            except Exception as e:
                logger.error("Erro de requisição", erro=str(e), url=url)
                raise IntegrationError(f"Falha ao conectar à API {url}") from e
