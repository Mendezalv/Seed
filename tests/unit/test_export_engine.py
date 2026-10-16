import io
from datetime import UTC, datetime
from decimal import Decimal
from uuid import uuid4

import openpyxl
import pytest

from src.operacional.domain.models import Maquinario, OrdemManutencao
from src.shared.database.models import Propriedade
from src.shared.export.export_engine import ExportEngine


def test_gerar_cotacoes_mercado_xlsx():
    sample_cotacoes = [
        {
            "codigo": "SOJA",
            "nome": "Soja Paranaguá",
            "mercado": "CEPEA / ESALQ",
            "preco": 138.40,
            "preco_anterior": 137.30,
            "variacao_pct": 0.80,
            "tendencia": "UP",
            "minima_dia": 136.90,
            "maxima_dia": 139.10,
            "volume_contratos": 14200,
            "unidade": "R$/sc 60kg",
        },
        {
            "codigo": "DOLAR",
            "nome": "Dólar Comercial",
            "mercado": "Banco Central / PTAX",
            "preco": 5.42,
            "preco_anterior": 5.44,
            "variacao_pct": -0.37,
            "tendencia": "DOWN",
            "minima_dia": 5.39,
            "maxima_dia": 5.46,
            "volume_contratos": 32000,
            "unidade": "R$",
        },
    ]

    sample_historicos = {
        "SOJA": [
            {"data": "2026-10-14", "preco": 137.30, "variacao_pct": 0.5, "volume": 12000},
            {"data": "2026-10-13", "preco": 136.60, "variacao_pct": -0.2, "volume": 11500},
        ],
        "DOLAR": [
            {"data": "2026-10-14", "preco": 5.44, "variacao_pct": 0.1, "volume": 29000},
        ],
    }

    xlsx_bytes = ExportEngine.gerar_cotacoes_mercado_xlsx(sample_cotacoes, sample_historicos)
    assert isinstance(xlsx_bytes, bytes)
    assert len(xlsx_bytes) > 0

    wb = openpyxl.load_workbook(io.BytesIO(xlsx_bytes))
    assert "Cotações em Tempo Real" in wb.sheetnames
    assert "Série Histórica (7D)" in wb.sheetnames

    ws1 = wb["Cotações em Tempo Real"]
    assert "SEED AGRO" in str(ws1["A1"].value)
    # Header na linha 4
    assert ws1["A4"].value == "Código"
    # Linha 5 tem SOJA
    assert ws1["A5"].value == "SOJA"
    assert ws1["B5"].value == "Soja Paranaguá"

    ws2 = wb["Série Histórica (7D)"]
    assert ws2["A4"].value == "Data Pregão"
    assert ws2["B5"].value == "SOJA"


def test_gerar_boletim_mercado_pdf():
    sample_cotacoes = [
        {
            "codigo": "SOJA",
            "nome": "Soja Paranaguá",
            "mercado": "CEPEA / ESALQ",
            "preco": 138.40,
            "variacao_pct": 0.80,
            "minima_dia": 136.90,
            "maxima_dia": 139.10,
        },
        {
            "codigo": "DOLAR",
            "nome": "Dólar Comercial",
            "mercado": "Banco Central / PTAX",
            "preco": 5.42,
            "variacao_pct": -0.37,
            "minima_dia": 5.39,
            "maxima_dia": 5.46,
        },
    ]
    sample_historicos = {
        "SOJA": [{"data": "2026-10-14", "preco": 137.30}],
    }

    pdf_bytes = ExportEngine.gerar_boletim_mercado_pdf(sample_cotacoes, sample_historicos)
    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF")
    assert len(pdf_bytes) > 1000


@pytest.mark.asyncio
async def test_gerar_relatorio_maquinarios_xlsx(session):
    prop_id = uuid4()
    propriedade = Propriedade(
        id=prop_id,
        nome="Fazenda Santa Fé",
        car_numero="MT-5105259-TESTE",
        municipio="Sorriso",
        estado="MT",
    )
    session.add(propriedade)
    await session.flush()

    maq = Maquinario(
        propriedade_id=prop_id,
        nome="Trator John Deere 8R 370",
        tipo="TRATOR",
        modelo="8R 370",
        ano_fabricacao=2023,
        horimetro_atual=Decimal("1250.5"),
        intervalo_preventiva=Decimal("500"),
        proximo_servico_em=Decimal("1500.0"),
        status="OPERACIONAL",
    )
    session.add(maq)
    await session.flush()

    os_item = OrdemManutencao(
        propriedade_id=prop_id,
        maquinario_id=maq.id,
        tipo="PREVENTIVA",
        descricao="Troca de filtros e óleo hidráulico",
        horimetro_na_abertura=Decimal("1000.0"),
        status="CONCLUIDA",
        prioridade="MEDIA",
        concluida_em=datetime.now(UTC),
        custo_estimado=Decimal("4500.00"),
        custo_real=Decimal("4320.00"),
    )
    session.add(os_item)
    await session.commit()

    xlsx_bytes = await ExportEngine.gerar_relatorio_maquinarios_xlsx(prop_id, session)
    assert isinstance(xlsx_bytes, bytes)
    assert len(xlsx_bytes) > 0

    wb = openpyxl.load_workbook(io.BytesIO(xlsx_bytes))
    assert "Frota de Maquinários" in wb.sheetnames
    assert "Ordens de Serviço" in wb.sheetnames

    ws_frota = wb["Frota de Maquinários"]
    assert "SEED AGRO" in str(ws_frota["A1"].value)
    assert ws_frota["A5"].value == "Trator John Deere 8R 370"

    ws_os = wb["Ordens de Serviço"]
    assert ws_os["B4"].value == "Trator John Deere 8R 370"


def test_gerar_dre_viabilidade_xlsx():
    sample_data = {
        "receita_bruta": 2768000.0,
        "custo_total": 1425000.0,
        "lucro_liquido": 1343000.0,
        "margem_percentual": 48.5,
        "custo_por_saca": 71.25,
        "break_even_sacas": 10178.5,
        "cenarios": [
            {
                "nome": "Pessimista (-20%)",
                "preco_saca": 110.72,
                "receita_bruta": 2214400.0,
                "lucro_liquido": 789400.0,
                "margem_percentual": 35.6,
            },
            {
                "nome": "Base",
                "preco_saca": 138.40,
                "receita_bruta": 2768000.0,
                "lucro_liquido": 1343000.0,
                "margem_percentual": 48.5,
            },
            {
                "nome": "Otimista (+20%)",
                "preco_saca": 166.08,
                "receita_bruta": 3321600.0,
                "lucro_liquido": 1896600.0,
                "margem_percentual": 57.1,
            },
        ],
    }

    prop = Propriedade(
        id=uuid4(),
        nome="Fazenda Santa Maria",
        car_numero="MT-5105259-88B124F6C123",
        municipio="Lucas do Rio Verde",
        estado="MT",
    )

    xlsx_bytes = ExportEngine.gerar_dre_viabilidade_xlsx(
        sample_data, prop, cultura="Soja Safra 2026"
    )
    assert isinstance(xlsx_bytes, bytes)
    assert len(xlsx_bytes) > 0

    wb = openpyxl.load_workbook(io.BytesIO(xlsx_bytes))
    assert "DRE Executivo" in wb.sheetnames
    ws = wb["DRE Executivo"]
    assert "DEMONSTRAÇÃO DE RESULTADO" in str(ws["A1"].value)
    assert ws["A4"].value == "Conta Contábil / Indicador"
    assert ws["A5"].value == "(+) RECEITA OPERACIONAL BRUTA"


def test_gerar_dre_viabilidade_pdf():
    sample_data = {
        "receita_bruta": 2768000.0,
        "custo_total": 1425000.0,
        "lucro_liquido": 1343000.0,
        "margem_percentual": 48.5,
        "custo_por_saca": 71.25,
        "break_even_sacas": 10178.5,
    }

    prop = Propriedade(
        id=uuid4(),
        nome="Fazenda Santa Maria",
        car_numero="MT-5105259-88B124F6C123",
        municipio="Lucas do Rio Verde",
        estado="MT",
    )

    pdf_bytes = ExportEngine.gerar_dre_viabilidade_pdf(sample_data, prop, cultura="Soja")
    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF")
    assert len(pdf_bytes) > 1000


@pytest.mark.asyncio
async def test_gerar_relatorio_executivo_consolidado_pdf_and_xlsx(session):
    prop_id = uuid4()
    propriedade = Propriedade(
        id=prop_id,
        nome="Fazenda Pioneira",
        car_numero="MT-5105259-CONSOL",
        municipio="Sorriso",
        estado="MT",
    )
    session.add(propriedade)
    await session.commit()

    # Teste PDF
    pdf_bytes = await ExportEngine.gerar_relatorio_executivo_consolidado_pdf(prop_id, session)
    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF")
    assert len(pdf_bytes) > 1000

    # Teste XLSX
    xlsx_bytes = await ExportEngine.gerar_relatorio_executivo_consolidado_xlsx(prop_id, session)
    assert isinstance(xlsx_bytes, bytes)
    assert len(xlsx_bytes) > 0
    wb = openpyxl.load_workbook(io.BytesIO(xlsx_bytes))
    assert "Resumo Executivo" in wb.sheetnames
    ws = wb["Resumo Executivo"]
    assert "SEED AGRO" in str(ws["A1"].value)

