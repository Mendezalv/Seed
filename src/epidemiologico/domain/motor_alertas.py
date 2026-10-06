import math
from uuid import UUID
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Dict, Any

from src.epidemiologico.domain.models import OcorrenciaSanitaria, AlertaEpidemiologico, DadosClimaticoCache

REGRAS_RISCO = {
    'ferrugem_asiatica': {'temp_ideal': (20, 25), 'umidade_ideal': 90, 'peso_clima': 0.6, 'peso_hist': 0.4},
    'lagarta_spodoptera': {'temp_ideal': (25, 30), 'umidade_ideal': 60, 'peso_clima': 0.5, 'peso_hist': 0.5},
    'cigarrinha_milho': {'temp_ideal': (27, 32), 'umidade_ideal': 50, 'peso_clima': 0.4, 'peso_hist': 0.6},
    'mosca_branca': {'temp_ideal': (28, 33), 'umidade_ideal': 40, 'peso_clima': 0.7, 'peso_hist': 0.3},
    'antracnose': {'temp_ideal': (22, 28), 'umidade_ideal': 85, 'peso_clima': 0.6, 'peso_hist': 0.4}
}

class MotorAlertasSanitarios:
    @staticmethod
    async def calcular_risco(propriedade_id: UUID, lat: float, lon: float, agente: str, session: AsyncSession) -> float:
        regra = REGRAS_RISCO.get(agente)
        if not regra:
            return 0.1 # Default baixo se não mapeado

        # Clima
        stmt_clima = select(DadosClimaticoCache).where(
            DadosClimaticoCache.latitude.between(lat - 0.5, lat + 0.5),
            DadosClimaticoCache.longitude.between(lon - 0.5, lon + 0.5)
        ).order_by(DadosClimaticoCache.data_referencia.desc()).limit(7)
        res_clima = await session.execute(stmt_clima)
        climas = res_clima.scalars().all()
        
        score_clima = MotorAlertasSanitarios._score_climatico(climas, regra)

        # Historico (raio 50km nos ultimos 30 dias)
        ocorrencias = await MotorAlertasSanitarios.buscar_ocorrencias_raio(session, lat, lon, 50.0, agente, 30)
        score_hist = MotorAlertasSanitarios._score_historico(ocorrencias)

        risco_final = (score_clima * regra['peso_clima']) + (score_hist * regra['peso_hist'])
        return min(max(risco_final, 0.0), 1.0)

    @staticmethod
    def _score_climatico(climas: list[DadosClimaticoCache], regra: Dict[str, Any]) -> float:
        if not climas:
            return 0.5
        score_total = 0.0
        for c in climas:
            t = c.temp_media_c or 25.0
            u = c.umidade_relativa_pct or 70.0
            t_min, t_max = regra['temp_ideal']
            
            s_t = 1.0 if t_min <= t <= t_max else max(0.0, 1.0 - abs((t_min + t_max)/2 - t) / 10.0)
            s_u = 1.0 if u >= regra['umidade_ideal'] else max(0.0, u / regra['umidade_ideal'])
            
            score_total += (s_t + s_u) / 2
        return score_total / len(climas)

    @staticmethod
    def _score_historico(ocorrencias: list[OcorrenciaSanitaria]) -> float:
        if not ocorrencias:
            return 0.0
        pesos_sev = {'BAIXA': 1, 'MEDIA': 2, 'ALTA': 3, 'CRITICA': 4}
        score = sum(pesos_sev.get(o.severidade, 1) for o in ocorrencias)
        # Normaliza (se tiver >= 10 criticas, = 1.0)
        return min(score / 40.0, 1.0)

    @staticmethod
    async def buscar_ocorrencias_raio(session: AsyncSession, lat: float, lon: float, raio_km: float, agente: str, dias: int) -> list[OcorrenciaSanitaria]:
        delta_deg = raio_km / 111.0 # Aproximacao
        data_limite = datetime.now(timezone.utc) - timedelta(days=dias)
        
        stmt = select(OcorrenciaSanitaria).where(
            OcorrenciaSanitaria.agente_identificado == agente,
            OcorrenciaSanitaria.latitude.between(lat - delta_deg, lat + delta_deg),
            OcorrenciaSanitaria.longitude.between(lon - delta_deg, lon + delta_deg),
            OcorrenciaSanitaria.observado_em >= data_limite
        )
        # Idealmente usar PostGIS ST_DWithin, simplificando com bounding box por restricoes do sqlite local se nao tiver postgis
        res = await session.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def processar_novas_ocorrencias(session: AsyncSession):
        pass # mock scheduled job
