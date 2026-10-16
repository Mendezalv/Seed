from __future__ import annotations

import pytest
from uuid import uuid4

from src.operacional.application.ndvi_service import NdviService
from src.operacional.application.telemetria import TelemetriaService
from src.operacional.application.lcdpr_service import LcdprService
from src.epidemiologico.application.copiloto_agro import CopilotoAgroService


def test_ndvi_service_gerar_serie():
    talhao_id = uuid4()
    resultado = NdviService.gerar_serie_ndvi_talhao(talhao_id, nome_talhao="Talhão Teste", cultura="Soja")
    assert resultado["talhao_id"] == str(talhao_id)
    assert resultado["cultura"] == "Soja"
    assert "historico_revisitas" in resultado
    assert len(resultado["historico_revisitas"]) > 0
    assert "estatisticas_zonas" in resultado
    assert "diagnostico_agronomico" in resultado
    assert resultado["ndvi_atual"] > 0


def test_telemetria_service_ao_vivo():
    posicoes = TelemetriaService.obter_posicoes_ao_vivo()
    assert isinstance(posicoes, list)
    assert len(posicoes) >= 3
    maquina = posicoes[0]
    assert "codigo" in maquina
    assert "velocidade_kmh" in maquina
    assert "posicao" in maquina
    assert "atualizado_em" in maquina


def test_lcdpr_service_dre_e_txt():
    # Teste DRE
    dre = LcdprService.gerar_dre_talhoes()
    assert isinstance(dre, list)
    assert len(dre) > 0
    primeiro = dre[0]
    assert "talhao_id" in primeiro
    assert "receita_bruta_total" in primeiro
    assert "margem_por_ha" in primeiro

    # Teste TXT LCDPR Oficial
    txt = LcdprService.gerar_arquivo_texto_lcdpr(ano_exercicio=2026, produtor_cpf="12345678900", produtor_nome="Fazenda Modelo")
    assert isinstance(txt, str)
    assert "0000|LCDPR|" in txt
    assert "0010|" in txt
    assert "Q100|" in txt
    assert "9999|" in txt


def test_copiloto_agro_consulta():
    resposta_ferrugem = CopilotoAgroService.responder_consulta("Como combater ferrugem asiática?", cultura="Soja")
    assert "resposta" in resposta_ferrugem
    assert resposta_ferrugem["alvo"] == "ferrugem asiática"
    assert len(resposta_ferrugem["principios_ativos"]) > 0

    resposta_geral = CopilotoAgroService.responder_consulta("Qual a melhor época para plantar?", cultura="Milho")
    assert "resposta" in resposta_geral
    assert len(resposta_geral["resposta"]) > 10
