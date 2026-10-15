import logging
import xml.etree.ElementTree as ET  # noqa: S405
from datetime import date

from pydantic import BaseModel

from src.shared.config import get_settings
from src.shared.integrations.base_client import BaseAPIClient

logger = logging.getLogger("seed.cptec")


class CidadeCPTEC(BaseModel):
    id: int
    nome: str
    estado: str


class PrevisaoDia(BaseModel):
    data: date
    tempo: str
    temperatura_max: float
    temperatura_min: float
    indice_uv: float


class PrevisaoCPTEC(BaseModel):
    cidade_id: int
    nome: str
    estado: str
    previsoes: list[PrevisaoDia]


class CPTECClient(BaseAPIClient):
    """Cliente para integração com a API do CPTEC."""

    def __init__(self) -> None:
        settings = get_settings()
        super().__init__(base_url=settings.CPTEC_BASE_URL)

    async def buscar_cidade(self, nome: str) -> list[CidadeCPTEC]:
        """Busca a lista de cidades e seus IDs pelo nome."""
        endpoint = "/listaCidades"
        params = {"city": nome}
        xml_data = await self.get(endpoint, params=params, cache_ttl=86400)

        cidades = []
        if isinstance(xml_data, str):
            try:
                root = ET.fromstring(xml_data)  # noqa: S314
                for cidade in root.findall("cidade"):
                    cidade_id = int(cidade.findtext("id", "0"))
                    nome_cidade = cidade.findtext("nome", "")
                    uf = cidade.findtext("uf", "")
                    cidades.append(CidadeCPTEC(id=cidade_id, nome=nome_cidade, estado=uf))
            except ET.ParseError as exc:
                logger.debug("Erro ao parsear XML de cidades CPTEC: %s", exc)

        return cidades

    async def previsao_7dias(self, cidade_id: int) -> PrevisaoCPTEC | None:
        """Obtém a previsão do tempo para os próximos 7 dias em uma cidade."""
        endpoint = f"/cidade/7dias/{cidade_id}/previsao.xml"
        xml_data = await self.get(endpoint, cache_ttl=3600)

        if isinstance(xml_data, str):
            try:
                root = ET.fromstring(xml_data)  # noqa: S314
                nome = root.findtext("nome", "")
                uf = root.findtext("uf", "")

                previsoes = []
                for prev in root.findall("previsao"):
                    data_txt = prev.findtext("dia", "")
                    tempo = prev.findtext("tempo", "")
                    maxima = float(prev.findtext("maxima", "0"))
                    minima = float(prev.findtext("minima", "0"))
                    iuv = float(prev.findtext("iuv", "0"))

                    if data_txt:
                        previsoes.append(
                            PrevisaoDia(
                                data=date.fromisoformat(data_txt),
                                tempo=tempo,
                                temperatura_max=maxima,
                                temperatura_min=minima,
                                indice_uv=iuv,
                            )
                        )

                return PrevisaoCPTEC(
                    cidade_id=cidade_id,
                    nome=nome,
                    estado=uf,
                    previsoes=previsoes,
                )
            except ET.ParseError as exc:
                logger.debug("Erro ao parsear XML de previsão CPTEC: %s", exc)
                return None
        return None
