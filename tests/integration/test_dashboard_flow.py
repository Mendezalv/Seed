import pytest
import pytest_asyncio
from uuid import UUID
from datetime import datetime, date, timezone
from decimal import Decimal
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.operacional.domain.models import Talhao, Safra, Maquinario, OrdemManutencao
from src.epidemiologico.domain.models import AlertaEpidemiologico, OcorrenciaSanitaria, DadosClimaticoCache
from src.energetico.domain.models import RelatorioESG

@pytest_asyncio.fixture
async def produtor_auth(async_client: AsyncClient) -> tuple[str, UUID, UUID]:
    register_payload = {
        "email": "fazendeiro@seed.agro",
        "nome_completo": "Fazenda Boa Vista",
        "senha": "SenhaForte123!",
        "role": "ADMIN"
    }
    await async_client.post("/api/v1/auth/registro", json=register_payload)
    resp = await async_client.post("/api/v1/auth/login", json={"email": "fazendeiro@seed.agro", "senha": "SenhaForte123!"})
    token = resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = await async_client.get("/api/v1/auth/me", headers=headers)
    user_id = UUID(me_resp.json()["id"])
    prop_id = UUID(me_resp.json()["propriedade_id"])
    return token, user_id, prop_id

@pytest.mark.asyncio
async def test_dashboard_consolidado_flow(
    async_client: AsyncClient,
    produtor_auth: tuple[str, UUID, UUID],
    session: AsyncSession
):
    token, user_id, prop_id = produtor_auth
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Popula entidades no banco para a propriedade
    now_utc = datetime.now(timezone.utc)
    
    talhao = Talhao(
        propriedade_id=prop_id,
        nome="Talhão Noroeste",
        area_hectares=Decimal("120.50"),
        cultura_atual="Soja",
        status="ATIVO"
    )
    session.add(talhao)
    await session.flush()

    safra = Safra(
        propriedade_id=prop_id,
        talhao_id=talhao.id,
        cultura="Soja",
        variedade="TMG 7062",
        data_plantio=date(2026, 9, 15),
        produtividade_estimada=Decimal("3600.00"),
        status="EM_ANDAMENTO"
    )
    session.add(safra)

    maquina = Maquinario(
        propriedade_id=prop_id,
        nome="Trator John Deere 8R",
        tipo="TRATOR",
        modelo="8R 370",
        ano_fabricacao=2024,
        horimetro_atual=Decimal("450.0"),
        proximo_servico_em=Decimal("500.0"),
        status="OPERACIONAL"
    )
    session.add(maquina)
    await session.flush()

    ordem = OrdemManutencao(
        propriedade_id=prop_id,
        maquinario_id=maquina.id,
        tipo="PREVENTIVA",
        descricao="Revisão periódica de 500 horas",
        horimetro_na_abertura=Decimal("450.0"),
        custo_estimado=Decimal("2500.00"),
        status="PENDENTE"
    )
    session.add(ordem)

    # Alerta epidemiológico com risco crítico
    alerta = AlertaEpidemiologico(
        propriedade_id=prop_id,
        tipo_alerta="SURTO",
        agente="Ferrugem Asiática",
        risco_score=0.85,
        fatores_contribuintes={"umidade": "alta", "temperatura": "favoravel"},
        latitude_centro=-12.55,
        longitude_centro=-55.65,
        raio_km=15.0,
        notificado=False
    )
    session.add(alerta)

    ocorrencia = OcorrenciaSanitaria(
        propriedade_id=prop_id,
        talhao_id=talhao.id,
        tipo_cultura="Soja",
        categoria="DOENCA",
        agente_identificado="Ferrugem Asiática",
        severidade="CRITICA",
        latitude=-12.55,
        longitude=-55.65,
        reportado_por=user_id,
        observado_em=now_utc,
        origem="APP_CAMPO"
    )
    session.add(ocorrencia)

    # Relatório ESG
    relatorio_esg = RelatorioESG(
        propriedade_id=prop_id,
        periodo="2026-09",
        emissao_total_co2e_ton=Decimal("14.500"),
        emissao_por_hectare=Decimal("0.120"),
        pct_energia_renovavel=Decimal("78.50"),
        intensidade_carbono=Decimal("0.050"),
        indicadores_detalhados={"escopo1": 12.0, "escopo2": 2.5},
        status="PUBLICADO"
    )
    session.add(relatorio_esg)

    # Dado climático
    clima = DadosClimaticoCache(
        latitude=-12.55,
        longitude=-55.65,
        data_referencia=date.today(),
        temp_media_c=29.4,
        umidade_relativa_pct=72.0,
        precipitacao_mm=15.2,
        fonte="INMET"
    )
    session.add(clima)
    await session.commit()

    # 2. Testa endpoint básico /minha/dashboard
    resp_basic = await async_client.get("/api/v1/propriedades/minha/dashboard", headers=headers)
    assert resp_basic.status_code == 200
    basic_data = resp_basic.json()
    assert basic_data["talhoes"] == 1
    assert basic_data["safras"] == 1
    assert basic_data["maquinarios"] == 1
    assert basic_data["ordens_manutencao_pendentes"] == 1
    assert basic_data["alertas_epidemiologicos"] == 1
    assert basic_data["relatorios_esg"] == 1

    # 3. Testa endpoint consolidado /minha/dashboard/consolidado
    resp_cons = await async_client.get("/api/v1/propriedades/minha/dashboard/consolidado", headers=headers)
    assert resp_cons.status_code == 200
    data = resp_cons.json()

    # Validação do Resumo Geral
    prop = data["propriedade"]
    assert prop["total_talhoes"] == 1
    assert prop["area_talhoes_hectares"] == 120.50
    assert prop["safras_ativas"] == 1
    assert "Soja" in prop["culturas_em_campo"]

    # Validação Operacional
    oper = data["operacional"]
    assert oper["total_maquinarios"] == 1
    assert oper["maquinas_operacionais"] == 1
    assert oper["ordens_manutencao_pendentes"] == 1

    # Validação Epidemiológica
    epi = data["epidemiologico"]
    assert epi["alertas_ativos"] == 1
    assert epi["score_risco_maximo"] == 0.85
    assert epi["nivel_risco_global"] == "CRITICO"
    assert epi["ocorrencias_recentes_30d"] == 1
    assert len(epi["principais_agentes"]) == 1
    assert epi["principais_agentes"][0]["agente"] == "Ferrugem Asiática"
    assert epi["principais_agentes"][0]["severidade_max"] == "CRITICA"

    # Validação ESG Sustentabilidade
    esg = data["sustentabilidade"]
    assert esg["emissao_recente_tco2e"] == 14.5
    assert esg["pct_energia_renovavel"] == 78.50
    assert esg["elegivel_credito_verde"] is True
    assert esg["ultimo_relatorio_status"] == "PUBLICADO"

    # Validação Clima
    clima_data = data["clima"]
    assert clima_data is not None
    assert clima_data["temperatura_c"] == 29.4
    assert clima_data["fonte"] == "INMET"
