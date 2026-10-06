"""
Script e utilitário de Carga Inicial (Seed Data) para o projeto Seed.

Carrega fontes de energia padrão com fatores de emissão oficiais (MCTI/Plano ABC+)
e insumos de referência no banco de dados para uma propriedade ou setup global.
"""

from decimal import Decimal
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.energetico.domain.models import FonteEnergia
from src.operacional.domain.models import Insumo

# Fontes de energia padrão para o agronegócio com fatores de emissão MCTI (kgCO2e por unidade)
FONTES_PADRAO = [
    {
        "tipo": "DIESEL",
        "categoria": "FOSSIL",
        "unidade_medida": "litros",
        "fator_emissao_co2": 2.603,
        "descricao": "Óleo diesel para tratores, colheitadeiras e caminhões agrícolas",
    },
    {
        "tipo": "GASOLINA",
        "categoria": "FOSSIL",
        "unidade_medida": "litros",
        "fator_emissao_co2": 2.212,
        "descricao": "Gasolina comum para utilitários e pequenos geradores",
    },
    {
        "tipo": "ETANOL",
        "categoria": "RENOVAVEL",
        "unidade_medida": "litros",
        "fator_emissao_co2": 0.029,
        "descricao": "Etanol hidratado combustível",
    },
    {
        "tipo": "SOLAR",
        "categoria": "RENOVAVEL",
        "unidade_medida": "kWh",
        "fator_emissao_co2": 0.0,
        "descricao": "Geração solar fotovoltaica na propriedade",
    },
    {
        "tipo": "BIOMASSA",
        "categoria": "RENOVAVEL",
        "unidade_medida": "kg",
        "fator_emissao_co2": 0.015,
        "descricao": "Biomassa de bagaço de cana, casca de arroz ou cavaco de madeira",
    },
    {
        "tipo": "EOLICA",
        "categoria": "RENOVAVEL",
        "unidade_medida": "kWh",
        "fator_emissao_co2": 0.0,
        "descricao": "Geração eólica para bombeamento ou geração elétrica",
    },
    {
        "tipo": "REDE_ELETRICA",
        "categoria": "FOSSIL",
        "unidade_medida": "kWh",
        "fator_emissao_co2": 0.0817,
        "descricao": "Eletricidade do Sistema Interligado Nacional (fator médio anual)",
    },
]

# Insumos agropecuários fundamentais de referência
INSUMOS_PADRAO = [
    {"tipo": "SEMENTE", "nome": "Semente de Soja Transgênica Intacta", "unidade_medida": "kg", "preco_unitario": Decimal("14.50")},
    {"tipo": "SEMENTE", "nome": "Semente de Milho Híbrido VT PRO", "unidade_medida": "kg", "preco_unitario": Decimal("18.20")},
    {"tipo": "DEFENSIVO", "nome": "Glifosato 480 SL (Herbicida)", "unidade_medida": "litros", "preco_unitario": Decimal("42.00")},
    {"tipo": "DEFENSIVO", "nome": "Azoxistrobina + Ciproconazol (Fungicida)", "unidade_medida": "litros", "preco_unitario": Decimal("130.00")},
    {"tipo": "DEFENSIVO", "nome": "Clorantraniliprole (Inseticida)", "unidade_medida": "litros", "preco_unitario": Decimal("290.00")},
    {"tipo": "VACINA", "nome": "Vacina Antiaftosa Bivalente", "unidade_medida": "doses", "preco_unitario": Decimal("2.10")},
    {"tipo": "VACINA", "nome": "Vacina Clostridiose Polivalente", "unidade_medida": "doses", "preco_unitario": Decimal("1.80")},
    {"tipo": "COMBUSTIVEL", "nome": "Óleo Diesel S10 Agrícola", "unidade_medida": "litros", "preco_unitario": Decimal("6.15")},
]


async def seed_fontes_energia(session: AsyncSession, propriedade_id: UUID) -> int:
    """Popula as fontes de energia para uma propriedade se ainda não existirem."""
    inseridos = 0
    for f in FONTES_PADRAO:
        stmt = select(FonteEnergia).where(
            FonteEnergia.propriedade_id == propriedade_id,
            FonteEnergia.tipo == f["tipo"]
        )
        res = await session.execute(stmt)
        if not res.scalar_one_or_none():
            nova_fonte = FonteEnergia(**f, propriedade_id=propriedade_id)
            session.add(nova_fonte)
            inseridos += 1
    if inseridos > 0:
        await session.commit()
    return inseridos


async def seed_insumos_padrao(session: AsyncSession) -> int:
    """Popula o catálogo de insumos padrão se ainda não existirem."""
    inseridos = 0
    for i in INSUMOS_PADRAO:
        stmt = select(Insumo).where(Insumo.nome == i["nome"])
        res = await session.execute(stmt)
        if not res.scalar_one_or_none():
            novo_insumo = Insumo(**i)
            session.add(novo_insumo)
            inseridos += 1
    if inseridos > 0:
        await session.commit()
    return inseridos
