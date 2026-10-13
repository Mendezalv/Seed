"""
Script de Carga Completa (Seed Database) para a Plataforma Seed Agro.

Popula o PostgreSQL + PostGIS com dados reais e estruturados da Fazenda Santa Maria:
- Propriedade rural com CAR e geolocalização em Lucas do Rio Verde / MT
- Usuários para autenticação (Gestor, Operador, Técnico) com senhas em bcrypt
- Talhões com geometrias PostGIS Polygon (WKT)
- Safras em andamento e planejadas
- Catálogo de insumos e lotes rastreáveis com códigos, fornecedores e validades
- Frotas e maquinários com horímetros e ordens de manutenção
- Ocorrências sanitárias georreferenciadas (Ferrugem, Percevejo, Lagarta) e alertas
- Matriz energética, consumos de combustível/eletricidade e relatórios ESG (GHG Protocol)
"""

import asyncio
import os
import sys

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")
from datetime import date, datetime, timezone
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from geoalchemy2.elements import WKTElement

# Garante path para src
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.shared.database.session import async_session_maker
from src.shared.database.models import Propriedade, Usuario
from src.shared.auth.services import hash_password
from src.operacional.domain.models import Insumo, LoteInsumo, Talhao, Safra, Maquinario, OrdemManutencao
from src.epidemiologico.domain.models import OcorrenciaSanitaria, AlertaEpidemiologico
from src.energetico.domain.models import FonteEnergia, ConsumoEnergia, RelatorioESG


async def seed_database() -> None:
    print("🌱 [SEED] Iniciando carga de dados no banco PostgreSQL / PostGIS...")
    async with async_session_maker() as session:
        # 1. Propriedade Rural
        stmt = select(Propriedade).where(Propriedade.cnpj_cpf == "04.892.112/0001-44")
        res = await session.execute(stmt)
        propriedade = res.scalar_one_or_none()

        if not propriedade:
            propriedade = Propriedade(
                nome="Fazenda Santa Maria",
                cnpj_cpf="04.892.112/0001-44",
                inscricao_estadual="13.442.890-1",
                endereco="Rodovia BR-163, Km 680 — Gleba Rio Verde",
                municipio="Lucas do Rio Verde",
                estado="MT",
                area_total_hectares=Decimal("1850.00"),
                car_numero="MT-5105259-88B124F6C123",
                status="ATIVA",
            )
            session.add(propriedade)
            await session.flush()
            print(f"  ✓ Propriedade criada: {propriedade.nome} ({propriedade.id})")
        else:
            print(f"  ✓ Propriedade existente: {propriedade.nome} ({propriedade.id})")

        prop_id = propriedade.id

        # 2. Usuários
        usuarios_data = [
            {
                "email": "admin@seed.agro.br",
                "nome_completo": "Dr. Fernando Silveira",
                "role": "GESTOR",
                "senha": "Admin@123",
            },
            {
                "email": "operador@seed.agro.br",
                "nome_completo": "Carlos Eduardo Silva",
                "role": "OPERADOR",
                "senha": "Operador@123",
            },
            {
                "email": "tecnico@seed.agro.br",
                "nome_completo": "Eng. Marcela Duarte",
                "role": "TECNICO",
                "senha": "Tecnico@123",
            },
        ]

        admin_user_id = None
        for u in usuarios_data:
            stmt = select(Usuario).where(Usuario.email == u["email"])
            res = await session.execute(stmt)
            user = res.scalar_one_or_none()
            if not user:
                user = Usuario(
                    email=u["email"],
                    nome_completo=u["nome_completo"],
                    senha_hash=hash_password(u["senha"]),
                    propriedade_id=prop_id,
                    role=u["role"],
                    ativo=True,
                )
                session.add(user)
                await session.flush()
                print(f"  ✓ Usuário criado: {u['email']} [{u['role']}]")
            else:
                print(f"  ✓ Usuário existente: {u['email']}")
            if u["role"] == "GESTOR":
                admin_user_id = user.id

        # 3. Talhões
        talhoes_data = [
            {
                "nome": "Talhão 01 — Sede",
                "area_hectares": Decimal("110.00"),
                "cultura_atual": "Soja Intacta",
                "status": "ATIVO",
                "wkt": "POLYGON((-55.7000 -12.5000, -55.6900 -12.5000, -55.6900 -12.5100, -55.7000 -12.5100, -55.7000 -12.5000))",
            },
            {
                "nome": "Talhão 02 — Pivô Central",
                "area_hectares": Decimal("180.00"),
                "cultura_atual": "Soja Intacta",
                "status": "ATIVO",
                "wkt": "POLYGON((-55.6900 -12.5000, -55.6800 -12.5000, -55.6800 -12.5100, -55.6900 -12.5100, -55.6900 -12.5000))",
            },
            {
                "nome": "Talhão 03 — Área Vizinha",
                "area_hectares": Decimal("120.00"),
                "cultura_atual": "Soja Sul",
                "status": "ATIVO",
                "wkt": "POLYGON((-55.7000 -12.5100, -55.6900 -12.5100, -55.6900 -12.5200, -55.7000 -12.5200, -55.7000 -12.5100))",
            },
            {
                "nome": "Talhão 04 — Milho Baixada",
                "area_hectares": Decimal("160.00"),
                "cultura_atual": "Milho Híbrido",
                "status": "ATIVO",
                "wkt": "POLYGON((-55.6800 -12.5000, -55.6700 -12.5000, -55.6700 -12.5100, -55.6800 -12.5100, -55.6800 -12.5000))",
            },
            {
                "nome": "Talhão 05 — Milho Alto",
                "area_hectares": Decimal("210.00"),
                "cultura_atual": "Milho Híbrido",
                "status": "ATIVO",
                "wkt": "POLYGON((-55.6900 -12.5100, -55.6800 -12.5100, -55.6800 -12.5200, -55.6900 -12.5200, -55.6900 -12.5100))",
            },
        ]

        talhao_map: dict[str, Talhao] = {}
        for td in talhoes_data:
            stmt = select(Talhao).where(Talhao.propriedade_id == prop_id, Talhao.nome == td["nome"])
            res = await session.execute(stmt)
            talhao = res.scalar_one_or_none()
            if not talhao:
                talhao = Talhao(
                    propriedade_id=prop_id,
                    nome=td["nome"],
                    area_hectares=td["area_hectares"],
                    cultura_atual=td["cultura_atual"],
                    status=td["status"],
                    geometria=WKTElement(td["wkt"], srid=4326),
                )
                session.add(talhao)
                await session.flush()
                print(f"  ✓ Talhão cadastrado: {td['nome']} ({td['area_hectares']} ha)")
            talhao_map[td["nome"]] = talhao

        # 4. Safras
        safras_data = [
            {
                "talhao_nome": "Talhão 01 — Sede",
                "cultura": "Soja",
                "variedade": "Monsoy 5947 IPRO",
                "data_plantio": date(2024, 10, 15),
                "produtividade_estimada": Decimal("68.00"),
                "status": "EM ANDAMENTO",
            },
            {
                "talhao_nome": "Talhão 02 — Pivô Central",
                "cultura": "Soja",
                "variedade": "Monsoy 5947 IPRO",
                "data_plantio": date(2024, 10, 18),
                "produtividade_estimada": Decimal("74.00"),
                "status": "EM ANDAMENTO",
            },
            {
                "talhao_nome": "Talhão 03 — Área Vizinha",
                "cultura": "Soja",
                "variedade": "Brasmax Desafio",
                "data_plantio": date(2024, 10, 22),
                "produtividade_estimada": Decimal("65.00"),
                "status": "EM ANDAMENTO",
            },
            {
                "talhao_nome": "Talhão 04 — Milho Baixada",
                "cultura": "Milho",
                "variedade": "DKB 360 PRO3",
                "data_plantio": date(2025, 2, 10),
                "produtividade_estimada": Decimal("112.00"),
                "status": "PLANEJADA",
            },
        ]

        safra_map: dict[str, Safra] = {}
        for sd in safras_data:
            talhao = talhao_map.get(sd["talhao_nome"])
            if talhao:
                stmt = select(Safra).where(
                    Safra.propriedade_id == prop_id,
                    Safra.talhao_id == talhao.id,
                    Safra.cultura == sd["cultura"],
                )
                res = await session.execute(stmt)
                safra = res.scalar_one_or_none()
                if not safra:
                    safra = Safra(
                        propriedade_id=prop_id,
                        talhao_id=talhao.id,
                        cultura=sd["cultura"],
                        variedade=sd["variedade"],
                        data_plantio=sd["data_plantio"],
                        produtividade_estimada=sd["produtividade_estimada"],
                        status=sd["status"],
                    )
                    session.add(safra)
                    await session.flush()
                    print(f"  ✓ Safra vinculada: {sd['cultura']} no {sd['talhao_nome']}")
                safra_map[sd["talhao_nome"]] = safra

        # 5. Insumos e Lotes Rastreáveis
        insumos_lotes_data = [
            {
                "insumo": {
                    "tipo": "DEFENSIVO",
                    "nome": "Azoxistrobina + Ciproconazol (Fungicida)",
                    "unidade_medida": "L",
                    "preco_unitario": Decimal("130.00"),
                },
                "lote": {
                    "codigo_lote": "LT-BAY-2024-04",
                    "quantidade_inicial": Decimal("500.000"),
                    "quantidade_atual": Decimal("180.000"),
                    "fornecedor": "Bayer CropScience",
                    "data_validade": date(2025, 1, 22),
                },
            },
            {
                "insumo": {
                    "tipo": "FERTILIZANTE",
                    "nome": "Cloreto de Potássio (KCl 60%)",
                    "unidade_medida": "kg",
                    "preco_unitario": Decimal("3.20"),
                },
                "lote": {
                    "codigo_lote": "LT-YAR-2024-88",
                    "quantidade_inicial": Decimal("60000.000"),
                    "quantidade_atual": Decimal("42000.000"),
                    "fornecedor": "Yara Brasil",
                    "data_validade": date(2026, 10, 15),
                },
            },
            {
                "insumo": {
                    "tipo": "SEMENTE",
                    "nome": "Semente Soja Monsoy 5947 IPRO",
                    "unidade_medida": "sc",
                    "preco_unitario": Decimal("245.00"),
                },
                "lote": {
                    "codigo_lote": "LT-SEM-24-019",
                    "quantidade_inicial": Decimal("800.000"),
                    "quantidade_atual": Decimal("320.000"),
                    "fornecedor": "Sementes Falcão",
                    "data_validade": date(2025, 3, 30),
                },
            },
            {
                "insumo": {
                    "tipo": "COMBUSTIVEL",
                    "nome": "Óleo Diesel S10 Rodoviário/Agrícola",
                    "unidade_medida": "L",
                    "preco_unitario": Decimal("5.85"),
                },
                "lote": {
                    "codigo_lote": "LT-VBR-2024-11",
                    "quantidade_inicial": Decimal("60000.000"),
                    "quantidade_atual": Decimal("42800.000"),
                    "fornecedor": "Vibra Energia",
                    "data_validade": date(2025, 5, 10),
                },
            },
            {
                "insumo": {
                    "tipo": "BIOLOGICO",
                    "nome": "Inoculante Bradyrhizobium japonicum",
                    "unidade_medida": "L",
                    "preco_unitario": Decimal("48.00"),
                },
                "lote": {
                    "codigo_lote": "LT-BIO-2024-90",
                    "quantidade_inicial": Decimal("300.000"),
                    "quantidade_atual": Decimal("140.000"),
                    "fornecedor": "Total Biotecnologia",
                    "data_validade": date(2025, 4, 12),
                },
            },
            {
                "insumo": {
                    "tipo": "DEFENSIVO",
                    "nome": "Glifosato 480 SL Herbicida",
                    "unidade_medida": "L",
                    "preco_unitario": Decimal("62.00"),
                },
                "lote": {
                    "codigo_lote": "LT-SYN-2024-12",
                    "quantidade_inicial": Decimal("400.000"),
                    "quantidade_atual": Decimal("85.000"),
                    "fornecedor": "Syngenta",
                    "data_validade": date(2025, 8, 18),
                },
            },
        ]

        for item in insumos_lotes_data:
            stmt = select(Insumo).where(Insumo.nome == item["insumo"]["nome"])
            res = await session.execute(stmt)
            insumo = res.scalar_one_or_none()
            if not insumo:
                insumo = Insumo(**item["insumo"])
                session.add(insumo)
                await session.flush()

            stmt_lote = select(LoteInsumo).where(
                LoteInsumo.propriedade_id == prop_id,
                LoteInsumo.codigo_lote == item["lote"]["codigo_lote"],
            )
            res_lote = await session.execute(stmt_lote)
            lote = res_lote.scalar_one_or_none()
            if not lote:
                lote = LoteInsumo(
                    propriedade_id=prop_id,
                    insumo_id=insumo.id,
                    codigo_lote=item["lote"]["codigo_lote"],
                    quantidade_inicial=item["lote"]["quantidade_inicial"],
                    quantidade_atual=item["lote"]["quantidade_atual"],
                    fornecedor=item["lote"]["fornecedor"],
                    data_validade=item["lote"]["data_validade"],
                    entrada_em=datetime.now(timezone.utc),
                )
                session.add(lote)
                await session.flush()
                print(f"  ✓ Lote cadastrado: {item['lote']['codigo_lote']} — {insumo.nome}")

        # 6. Maquinários e Frotas
        maquinarios_data = [
            {
                "nome": "John Deere 8370R",
                "tipo": "TRATOR",
                "modelo": "TR-01",
                "ano_fabricacao": 2022,
                "horimetro_atual": Decimal("1492.00"),
                "intervalo_preventiva": Decimal("1500.00"),
                "proximo_servico_em": Decimal("8.00"),
                "status": "OPERANDO",
            },
            {
                "nome": "Case IH Magnum 380",
                "tipo": "TRATOR",
                "modelo": "TR-02",
                "ano_fabricacao": 2023,
                "horimetro_atual": Decimal("840.00"),
                "intervalo_preventiva": Decimal("1000.00"),
                "proximo_servico_em": Decimal("160.00"),
                "status": "OPERANDO",
            },
            {
                "nome": "John Deere S790",
                "tipo": "COLHEITADEIRA",
                "modelo": "CH-01",
                "ano_fabricacao": 2021,
                "horimetro_atual": Decimal("640.00"),
                "intervalo_preventiva": Decimal("1000.00"),
                "proximo_servico_em": Decimal("360.00"),
                "status": "PATIO",
            },
            {
                "nome": "Jacto Uniport 3030",
                "tipo": "PULVERIZADOR",
                "modelo": "PV-01",
                "ano_fabricacao": 2023,
                "horimetro_atual": Decimal("980.00"),
                "intervalo_preventiva": Decimal("1000.00"),
                "proximo_servico_em": Decimal("20.00"),
                "status": "OPERANDO",
            },
        ]

        for md in maquinarios_data:
            stmt = select(Maquinario).where(
                Maquinario.propriedade_id == prop_id,
                Maquinario.nome == md["nome"],
            )
            res = await session.execute(stmt)
            maq = res.scalar_one_or_none()
            if not maq:
                maq = Maquinario(propriedade_id=prop_id, **md)
                session.add(maq)
                await session.flush()
                print(f"  ✓ Maquinário registrado: {md['nome']} ({md['modelo']})")

                # Cria Ordem de Manutenção para o TR-01
                if md["modelo"] == "TR-01":
                    os_item = OrdemManutencao(
                        propriedade_id=prop_id,
                        maquinario_id=maq.id,
                        tipo="PREVENTIVA",
                        descricao="Revisão preventiva periódica de 1.500 horas de motor e troca do óleo Plus-50 II",
                        horimetro_na_abertura=Decimal("1492.00"),
                        status="EM_EXECUCAO",
                        prioridade="ALTA",
                        custo_estimado=Decimal("3200.00"),
                    )
                    session.add(os_item)
                    await session.flush()
                    print(f"    ↳ OS aberta para {md['nome']}: Revisão de 1.500h")

        # 7. Ocorrências Sanitárias e Alertas
        talhao_t02 = talhao_map.get("Talhão 02 — Pivô Central")
        talhao_t05 = talhao_map.get("Talhão 05 — Milho Alto")

        ocorrencias_data = [
            {
                "talhao_id": talhao_t02.id if talhao_t02 else None,
                "tipo_cultura": "Soja",
                "categoria": "DOENCA",
                "agente_identificado": "Ferrugem Asiática (Phakopsora pachyrhizi)",
                "severidade": "CRITICA",
                "latitude": -12.5000,
                "longitude": -55.7000,
                "origem": "APP_CAMPO",
                "observado_em": datetime.now(timezone.utc),
            },
            {
                "talhao_id": talhao_t05.id if talhao_t05 else None,
                "tipo_cultura": "Milho",
                "categoria": "PRAGA",
                "agente_identificado": "Percevejo-marrom (Euschistus heros)",
                "severidade": "MEDIA",
                "latitude": -12.4920,
                "longitude": -55.6890,
                "origem": "SENSOR",
                "observado_em": datetime.now(timezone.utc),
            },
        ]

        if admin_user_id:
            for oc in ocorrencias_data:
                stmt = select(OcorrenciaSanitaria).where(
                    OcorrenciaSanitaria.propriedade_id == prop_id,
                    OcorrenciaSanitaria.agente_identificado == oc["agente_identificado"],
                )
                res = await session.execute(stmt)
                if not res.scalar_one_or_none():
                    nova_oc = OcorrenciaSanitaria(
                        propriedade_id=prop_id,
                        reportado_por=admin_user_id,
                        **oc,
                    )
                    session.add(nova_oc)
                    print(f"  ✓ Ocorrência fitossanitária: {oc['agente_identificado']} [{oc['severidade']}]")

            # Alerta epidemiológico
            stmt_al = select(AlertaEpidemiologico).where(
                AlertaEpidemiologico.propriedade_id == prop_id,
                AlertaEpidemiologico.agente == "Ferrugem Asiática",
            )
            res_al = await session.execute(stmt_al)
            if not res_al.scalar_one_or_none():
                alerta = AlertaEpidemiologico(
                    propriedade_id=prop_id,
                    tipo_alerta="SURTO",
                    agente="Ferrugem Asiática",
                    risco_score=0.85,
                    fatores_contribuintes={"temperatura_otima": True, "umidade_alta": True, "vento_dispersao": "SE"},
                    latitude_centro=-12.5000,
                    longitude_centro=-55.7000,
                    raio_km=25.0,
                    notificado=True,
                )
                session.add(alerta)
                print("  ✓ Alerta epidemiológico emitido: Dispersão de esporos ativa")

        # 8. Fontes de Energia e Relatórios ESG
        fontes_data = [
            {"tipo": "BIODIESEL", "categoria": "RENOVAVEL", "unidade_medida": "litros", "fator_emissao_co2": 0.42, "descricao": "Biodiesel B20 Biocombustível"},
            {"tipo": "DIESEL", "categoria": "FOSSIL", "unidade_medida": "litros", "fator_emissao_co2": 2.603, "descricao": "Diesel Fóssil S10"},
            {"tipo": "SOLAR", "categoria": "RENOVAVEL", "unidade_medida": "kWh", "fator_emissao_co2": 0.0, "descricao": "Solar Fotovoltaica Própria"},
            {"tipo": "REDE_ELETRICA", "categoria": "FOSSIL", "unidade_medida": "kWh", "fator_emissao_co2": 0.0817, "descricao": "Rede Elétrica Concessionária"},
        ]

        fonte_solar = None
        for fd in fontes_data:
            stmt = select(FonteEnergia).where(
                FonteEnergia.propriedade_id == prop_id,
                FonteEnergia.tipo == fd["tipo"],
            )
            res = await session.execute(stmt)
            f = res.scalar_one_or_none()
            if not f:
                f = FonteEnergia(propriedade_id=prop_id, **fd)
                session.add(f)
                await session.flush()
                print(f"  ✓ Fonte energética registrada: {fd['tipo']} [{fd['categoria']}]")
            if fd["tipo"] == "SOLAR":
                fonte_solar = f

        # Consumo e Relatório ESG de Setembro
        if fonte_solar:
            stmt_cons = select(ConsumoEnergia).where(
                ConsumoEnergia.propriedade_id == prop_id,
                ConsumoEnergia.fonte_id == fonte_solar.id,
            )
            res_cons = await session.execute(stmt_cons)
            if not res_cons.scalar_one_or_none():
                consumo = ConsumoEnergia(
                    propriedade_id=prop_id,
                    fonte_id=fonte_solar.id,
                    periodo_inicio=date(2026, 9, 1),
                    periodo_fim=date(2026, 9, 30),
                    quantidade_consumida=Decimal("12500.000"),
                    custo_total_brl=Decimal("0.00"),
                    equipamento_ref="UFV Sede Solar",
                )
                session.add(consumo)
                print("  ✓ Lançamento de consumo registrado: UFV Solar (12.500 kWh)")

        # Relatório ESG
        stmt_esg = select(RelatorioESG).where(
            RelatorioESG.propriedade_id == prop_id,
            RelatorioESG.periodo == "2026-09",
        )
        res_esg = await session.execute(stmt_esg)
        if not res_esg.scalar_one_or_none():
            rel_esg = RelatorioESG(
                propriedade_id=prop_id,
                periodo="2026-09",
                emissao_total_co2e_ton=Decimal("7.820"),
                emissao_por_hectare=Decimal("0.011"),
                pct_energia_renovavel=Decimal("71.20"),
                intensidade_carbono=Decimal("0.011"),
                indicadores_detalhados={"score_abc_plus": "A+", "bonus_juros": 1.0, "status": "HOMOLOGADO"},
                status="PUBLICADO",
            )
            session.add(rel_esg)
            print("  ✓ Relatório ESG 2026-09 homologado: Rating A+ (71.2% Renovável)")

        await session.commit()

    print("✅ [SEED] Carga de dados concluída com sucesso!")


if __name__ == "__main__":
    asyncio.run(seed_database())
