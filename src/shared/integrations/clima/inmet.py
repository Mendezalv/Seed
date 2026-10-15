import logging
from datetime import date
from typing import Any

from pydantic import BaseModel

from src.shared.config import get_settings
from src.shared.integrations.base_client import BaseAPIClient

logger = logging.getLogger("seed.inmet")


class EstacaoINMET(BaseModel):
    codigo: str
    nome: str
    estado: str
    latitude: float
    longitude: float


class DadosMeteorologicos(BaseModel):
    data: date
    hora: str
    temperatura_max: float | None = None
    temperatura_min: float | None = None
    umidade: float | None = None
    precipitacao: float | None = None


class INMETClient(BaseAPIClient):
    """Cliente para integração com a API do INMET."""

    def __init__(self) -> None:
        settings = get_settings()
        super().__init__(base_url=settings.INMET_BASE_URL)

    async def listar_estacoes(self) -> list[EstacaoINMET]:
        """Lista todas as estações meteorológicas disponíveis no INMET."""
        data = await self.get("/estacoes", cache_ttl=86400)

        estacoes = []
        if isinstance(data, list):
            for item in data:
                try:
                    estacoes.append(
                        EstacaoINMET(
                            codigo=item.get("CD_ESTACAO", ""),
                            nome=item.get("DC_NOME", ""),
                            estado=item.get("SG_ESTADO", ""),
                            latitude=float(item.get("VL_LATITUDE", 0.0)),
                            longitude=float(item.get("VL_LONGITUDE", 0.0)),
                        )
                    )
                except (ValueError, TypeError):
                    continue
        return estacoes

    async def obter_dados_estacao(
        self, codigo: str, data_inicio: date, data_fim: date
    ) -> list[DadosMeteorologicos]:
        """Obtém os dados meteorológicos horários de uma estação em um período."""
        d_ini = data_inicio.strftime("%Y-%m-%d")
        d_fim = data_fim.strftime("%Y-%m-%d")
        endpoint = f"/estacao/{d_ini}/{d_fim}/{codigo}"
        data = await self.get(endpoint, cache_ttl=3600)

        resultados = []
        if isinstance(data, list):
            for item in data:
                try:
                    resultados.append(
                        DadosMeteorologicos(
                            data=date.fromisoformat(item.get("DT_MEDICAO", "2000-01-01")),
                            hora=item.get("HR_MEDICAO", "0000"),
                            temperatura_max=self._parse_float(item.get("TEM_MAX")),
                            temperatura_min=self._parse_float(item.get("TEM_MIN")),
                            umidade=self._parse_float(item.get("UMD_MAX")),
                            precipitacao=self._parse_float(item.get("CHUVA")),
                        )
                    )
                except Exception as exc:
                    logger.debug("Erro ao parsear leitura horária INMET: %s", exc)
                    continue
        return resultados

    async def obter_dados_diarios(
        self, codigo: str, data_inicio: date, data_fim: date
    ) -> list[DadosMeteorologicos]:
        """Obtém os dados meteorológicos diários agregados."""
        d_ini = data_inicio.strftime("%Y-%m-%d")
        d_fim = data_fim.strftime("%Y-%m-%d")
        endpoint = f"/estacao/diaria/{d_ini}/{d_fim}/{codigo}"
        data = await self.get(endpoint, cache_ttl=3600)

        resultados = []
        if isinstance(data, list):
            for item in data:
                try:
                    resultados.append(
                        DadosMeteorologicos(
                            data=date.fromisoformat(item.get("DT_MEDICAO", "2000-01-01")),
                            hora="0000",
                            temperatura_max=self._parse_float(item.get("TEMP_MAX")),
                            temperatura_min=self._parse_float(item.get("TEMP_MIN")),
                            umidade=self._parse_float(item.get("UMID_MED")),
                            precipitacao=self._parse_float(item.get("CHUVA")),
                        )
                    )
                except Exception as exc:
                    logger.debug("Erro ao parsear leitura diária INMET: %s", exc)
                    continue
        return resultados

    def _parse_float(self, value: Any) -> float | None:
        if value is None:
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
