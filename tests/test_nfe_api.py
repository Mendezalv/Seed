import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app
from tests.test_nfe_parser import XML_NFE_EXEMPLO

@pytest.mark.asyncio
async def test_api_parse_nfe_json():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/operacional/insumos/nfe/parse", json={"xml_content": XML_NFE_EXEMPLO})
        assert res.status_code == 200
        data = res.json()
        assert data["numero_nf"] == "4582"
        assert data["emitente"]["razao_social"] == "Bayer S.A. Protecao de Cultivos"
        assert len(data["itens"]) == 2

@pytest.mark.asyncio
async def test_api_parse_nfe_file_upload():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("nfe_teste.xml", XML_NFE_EXEMPLO.encode("utf-8"), "application/xml")}
        res = await ac.post("/api/v1/operacional/insumos/nfe/upload", files=files)
        assert res.status_code == 200
        data = res.json()
        assert data["chave_acesso"] == "35241012345678000199550010000045821098765432"
