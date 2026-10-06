from datetime import date
from pydantic import BaseModel
from typing import Any, Optional
from src.shared.integrations.base_client import BaseAPIClient
from src.shared.config import get_settings

class EstacaoINMET(BaseModel):
    codigo: str
    nome: str
    estado: str
    latitude: float
    longitude: float

class DadosMeteorologicos(BaseModel):
    data: date
    hora: str
    temperatura_max: Optional[float] = None
    temperatura_min: Optional[float] = None
    umidade: Optional[float] = None
    precipitacao: Optional[float] = None

class INMETClient(BaseAPIClient):
    """
    Cliente para integração com a API do INMET.
    """
    def __init__(self):
        settings = get_settings()
        super().__init__(base_url=settings.INMET_BASE_URL)

    async def listar_estacoes(self) -> list[EstacaoINMET]:
        """
        Lista todas as estações meteorológicas disponíveis no INMET.
        """
        data = await self.get("/estacoes", cache_ttl=86400)
        
        estacoes = []
        if isinstance(data, list):
            for item in data:
                try:
                    estacoes.append(EstacaoINMET(
                        codigo=item.get("CD_ESTACAO", ""),
                        nome=item.get("DC_NOME", ""),
                        estado=item.get("SG_ESTADO", ""),
                        latitude=float(item.get("VL_LATITUDE", 0.0)),
                        longitude=float(item.get("VL_LONGITUDE", 0.0))
                    ))
                except (ValueError, TypeError):
                    continue
        return estacoes

    async def obter_dados_estacao(self, codigo: str, data_inicio: date, data_fim: date) -> list[DadosMeteorologicos]:
        """
        Obtém os dados meteorológicos horários de uma estação em um período.
        """
        endpoint = f"/estacao/{data_inicio.strftime('%Y-%m-%d')}/{data_fim.strftime('%Y-%m-%d')}/{codigo}"
        data = await self.get(endpoint, cache_ttl=3600)
        
        resultados = []
        if isinstance(data, list):
            for item in data:
                try:
                    resultados.append(DadosMeteorologicos(
                        data=date.fromisoformat(item.get("DT_MEDICAO", "2000-01-01")),
                        hora=item.get("HR_MEDICAO", "0000"),
                        temperatura_max=self._parse_float(item.get("TEM_MAX")),
                        temperatura_min=self._parse_float(item.get("TEM_MIN")),
                        umidade=self._parse_float(item.get("UMD_MAX")),
                        precipitacao=self._parse_float(item.get("CHUVA"))
                    ))
                except Exception:
                    continue
        return resultados

    async def obter_dados_diarios(self, codigo: str, data_inicio: date, data_fim: date) -> list[DadosMeteorologicos]:
        """
        Obtém os dados meteorológicos diários agregados.
        """
        endpoint = f"/estacao/diaria/{data_inicio.strftime('%Y-%m-%d')}/{data_fim.strftime('%Y-%m-%d')}/{codigo}"
        data = await self.get(endpoint, cache_ttl=3600)
        
        resultados = []
        if isinstance(data, list):
            for item in data:
                try:
                    resultados.append(DadosMeteorologicos(
                        data=date.fromisoformat(item.get("DT_MEDICAO", "2000-01-01")),
                        hora="0000",
                        temperatura_max=self._parse_float(item.get("TEMP_MAX")),
                        temperatura_min=self._parse_float(item.get("TEMP_MIN")),
                        umidade=self._parse_float(item.get("UMID_MED")),
                        precipitacao=self._parse_float(item.get("CHUVA"))
                    ))
                except Exception:
                    continue
        return resultados

    def _parse_float(self, value: Any) -> Optional[float]:
        if value is None:
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
