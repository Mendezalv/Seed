from __future__ import annotations

import pytest
from src.operacional.application.nfe_parser import NfeParser

XML_NFE_EXEMPLO = """<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35241012345678000199550010000045821098765432" versao="4.00">
      <ide>
        <nNF>4582</nNF>
        <serie>1</serie>
        <dhEmi>2026-10-14T10:30:00-03:00</dhEmi>
      </ide>
      <emit>
        <CNPJ>12345678000199</CNPJ>
        <xNome>Bayer S.A. Protecao de Cultivos</xNome>
        <xFant>Bayer CropScience</xFant>
        <enderEmit>
          <xMun>Ribeirão Preto</xMun>
          <UF>SP</UF>
        </enderEmit>
      </emit>
      <dest>
        <CNPJ>98765432000100</CNPJ>
        <xNome>Fazenda Santa Maria Agropecuaria</xNome>
      </dest>
      <total>
        <ICMSTot>
          <vNF>78250.00</vNF>
        </ICMSTot>
      </total>
      <det nItem="1">
        <prod>
          <cProd>FUNG-001</cProd>
          <xProd>Fox Xpro Fungicida Sistemico</xProd>
          <NCM>38089290</NCM>
          <CFOP>5102</CFOP>
          <uCom>L</uCom>
          <qCom>250.00</qCom>
          <vUnCom>185.00</vUnCom>
          <vProd>46250.00</vProd>
          <rastro>
            <nLote>LT-BAY-2026-99</nLote>
            <dFab>2026-05-10</dFab>
            <dVal>2028-05-10</dVal>
          </rastro>
        </prod>
      </det>
      <det nItem="2">
        <prod>
          <cProd>FERT-009</cProd>
          <xProd>Cloreto de Potassio KCl Granulado</xProd>
          <NCM>31042090</NCM>
          <CFOP>5102</CFOP>
          <uCom>KG</uCom>
          <qCom>10000.00</qCom>
          <vUnCom>3.20</vUnCom>
          <vProd>32000.00</vProd>
        </prod>
      </det>
    </infNFe>
  </NFe>
</nfeProc>"""


def test_parse_nfe_com_sucesso():
    dados = NfeParser.parse_xml_content(XML_NFE_EXEMPLO)
    assert dados["chave_acesso"] == "35241012345678000199550010000045821098765432"
    assert dados["numero_nf"] == "4582"
    assert dados["emitente"]["razao_social"] == "Bayer S.A. Protecao de Cultivos"
    assert dados["emitente"]["cnpj"] == "12345678000199"
    assert dados["quantidade_itens"] == 2
    assert dados["valor_total_nf"] == 78250.0

    # Item 1: Fungicida
    item1 = dados["itens"][0]
    assert item1["nome_produto"] == "Fox Xpro Fungicida Sistemico"
    assert item1["categoria"] == "DEFENSIVO"
    assert item1["quantidade"] == 250.0
    assert item1["custo_unitario"] == 185.0
    assert item1["codigo_lote"] == "LT-BAY-2026-99"
    assert item1["data_validade"] == "2028-05-10"

    # Item 2: Fertilizante KCl
    item2 = dados["itens"][1]
    assert item2["nome_produto"] == "Cloreto de Potassio KCl Granulado"
    assert item2["categoria"] == "FERTILIZANTE"
    assert item2["quantidade"] == 10000.0
    assert item2["custo_unitario"] == 3.20
    assert "LT-BAYER" in item2["codigo_lote"]


def test_parse_xml_invalido():
    with pytest.raises(ValueError):
        NfeParser.parse_xml_content("<invalid>xml</invalid>")
