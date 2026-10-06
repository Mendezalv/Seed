from datetime import date, datetime
from pydantic import BaseModel
from src.shared.integrations.base_client import BaseAPIClient
from src.shared.config import get_settings

class CotacaoPTAX(BaseModel):
    data: date
    compra: float
    venda: float
    datetime_cotacao: datetime

class BCBClient(BaseAPIClient):
    """
    Cliente para integração com a API do Banco Central (SGS / PTAX).
    """
    def __init__(self):
        settings = get_settings()
        super().__init__(base_url=settings.BCB_BASE_URL)

    async def obter_ptax(self, data_cotacao: date) -> list[CotacaoPTAX]:
        """
        Obtém a cotação do Dólar PTAX (Compra e Venda) para um dia específico.
        """
        data_formatada = data_cotacao.strftime('%m-%d-%Y')
        endpoint = f"/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='{data_formatada}'&$format=json"
        
        response_data = await self.get(endpoint, cache_ttl=86400)
        
        resultados = []
        if isinstance(response_data, dict) and "value" in response_data:
            for item in response_data["value"]:
                try:
                    resultados.append(CotacaoPTAX(
                        data=data_cotacao,
                        compra=float(item.get("cotacaoCompra", 0.0)),
                        venda=float(item.get("cotacaoVenda", 0.0)),
                        datetime_cotacao=datetime.fromisoformat(item.get("dataHoraCotacao", "").replace("Z", "+00:00"))
                    ))
                except (ValueError, TypeError):
                    continue
        return resultados

    async def obter_ptax_periodo(self, data_inicio: date, data_fim: date) -> list[CotacaoPTAX]:
        """
        Obtém as cotações PTAX em um intervalo de datas.
        """
        dt_ini = data_inicio.strftime('%m-%d-%Y')
        dt_fim = data_fim.strftime('%m-%d-%Y')
        endpoint = f"/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='{dt_ini}'&@dataFinalCotacao='{dt_fim}'&$format=json"
        
        response_data = await self.get(endpoint, cache_ttl=86400)
        
        resultados = []
        if isinstance(response_data, dict) and "value" in response_data:
            for item in response_data["value"]:
                try:
                    data_hora_str = item.get("dataHoraCotacao", "")
                    if data_hora_str:
                        dt_cotacao = datetime.fromisoformat(data_hora_str.replace("Z", "+00:00"))
                        d_cotacao = dt_cotacao.date()
                    else:
                        continue
                        
                    resultados.append(CotacaoPTAX(
                        data=d_cotacao,
                        compra=float(item.get("cotacaoCompra", 0.0)),
                        venda=float(item.get("cotacaoVenda", 0.0)),
                        datetime_cotacao=dt_cotacao
                    ))
                except (ValueError, TypeError):
                    continue
        return resultados
