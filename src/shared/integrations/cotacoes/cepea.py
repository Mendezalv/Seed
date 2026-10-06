from datetime import date
from pydantic import BaseModel
import agrobr

class CotacaoCommodity(BaseModel):
    produto: str
    preco_brl: float
    data: date
    variacao_pct: float
    unidade: str

class CEPEAClient:
    """
    Cliente para buscar cotações do CEPEA utilizando a biblioteca agrobr.
    """
    
    async def obter_cotacao_soja(self) -> CotacaoCommodity:
        """
        Obtém a cotação mais recente da Soja.
        """
        return self._buscar_cotacao("soja", "sc 60kg")

    async def obter_cotacao_milho(self) -> CotacaoCommodity:
        """
        Obtém a cotação mais recente do Milho.
        """
        return self._buscar_cotacao("milho", "sc 60kg")

    async def obter_cotacao_boi(self) -> CotacaoCommodity:
        """
        Obtém a cotação mais recente do Boi Gordo.
        """
        return self._buscar_cotacao("boi", "@")

    async def obter_cotacao_cafe(self) -> CotacaoCommodity:
        """
        Obtém a cotação mais recente do Café.
        """
        return self._buscar_cotacao("cafe", "sc 60kg")

    def _buscar_cotacao(self, produto: str, unidade: str) -> CotacaoCommodity:
        """
        Método interno para padronizar a chamada à biblioteca agrobr e o retorno.
        """
        try:
            df = agrobr.CEPEA().get_data(produto)
            if not df.empty:
                latest = df.iloc[0]
                return CotacaoCommodity(
                    produto=produto.capitalize(),
                    preco_brl=float(latest.get('valor', 0.0)),
                    data=latest.get('data', date.today()),
                    variacao_pct=float(latest.get('variacao', 0.0)),
                    unidade=unidade
                )
        except Exception:
            pass
        
        return CotacaoCommodity(
            produto=produto.capitalize(),
            preco_brl=0.0,
            data=date.today(),
            variacao_pct=0.0,
            unidade=unidade
        )
