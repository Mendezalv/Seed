from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from datetime import datetime
from typing import Optional

from src.epidemiologico.domain.models import OcorrenciaSanitaria, AlertaEpidemiologico
from src.epidemiologico.domain.schemas import (
    OcorrenciaSanitariaCreate,
    MapaCalorResponse,
    MapaCalorPontoResponse
)
from src.epidemiologico.domain.motor_alertas import MotorAlertasSanitarios

class VigilanciaService:
    @staticmethod
    async def registrar_ocorrencia(ocorrencia: OcorrenciaSanitariaCreate, propriedade_id: UUID, session: AsyncSession) -> OcorrenciaSanitaria:
        nova = OcorrenciaSanitaria(**ocorrencia.model_dump(), propriedade_id=propriedade_id)
        session.add(nova)
        await session.flush()

        # Dispara calculo de risco
        risco = await MotorAlertasSanitarios.calcular_risco(
            propriedade_id, nova.latitude, nova.longitude, nova.agente_identificado, session
        )

        if risco > 0.7:
            alerta = AlertaEpidemiologico(
                propriedade_id=propriedade_id,
                tipo_alerta="RISCO_ELEVADO",
                agente=nova.agente_identificado,
                risco_score=risco,
                fatores_contribuintes={"clima": "favorável", "proximidade": "alta"},
                latitude_centro=nova.latitude,
                longitude_centro=nova.longitude,
                raio_km=20.0
            )
            session.add(alerta)
            await session.flush()

        return nova

    @staticmethod
    async def listar_ocorrencias(propriedade_id: UUID, filtros: dict, session: AsyncSession) -> list[OcorrenciaSanitaria]:
        stmt = select(OcorrenciaSanitaria).where(OcorrenciaSanitaria.propriedade_id == propriedade_id)
        if filtros.get('agente'):
            stmt = stmt.where(OcorrenciaSanitaria.agente_identificado == filtros['agente'])
        stmt = stmt.order_by(OcorrenciaSanitaria.observado_em.desc())
        
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def listar_alertas(propriedade_id: UUID, session: AsyncSession) -> list[AlertaEpidemiologico]:
        stmt = select(AlertaEpidemiologico).where(
            AlertaEpidemiologico.propriedade_id == propriedade_id,
            AlertaEpidemiologico.notificado == False
        ).order_by(AlertaEpidemiologico.risco_score.desc())
        
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def obter_mapa_calor(
        propriedade_id: UUID,
        session: AsyncSession,
        agente: Optional[str] = None,
        severidade: Optional[str] = None,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None,
        min_lat: Optional[float] = None,
        max_lat: Optional[float] = None,
        min_lon: Optional[float] = None,
        max_lon: Optional[float] = None
    ) -> MapaCalorResponse:
        """
        Retorna agregação geoespacial para geração de mapa de calor com filtros
        por agente, período, severidade e delimitação geográfica (Bounding Box).
        """
        stmt = select(OcorrenciaSanitaria).where(OcorrenciaSanitaria.propriedade_id == propriedade_id)
        
        if agente:
            stmt = stmt.where(OcorrenciaSanitaria.agente_identificado == agente)
        if severidade:
            stmt = stmt.where(OcorrenciaSanitaria.severidade == severidade)
        if data_inicio:
            stmt = stmt.where(OcorrenciaSanitaria.observado_em >= data_inicio)
        if data_fim:
            stmt = stmt.where(OcorrenciaSanitaria.observado_em <= data_fim)
        if min_lat is not None:
            stmt = stmt.where(OcorrenciaSanitaria.latitude >= min_lat)
        if max_lat is not None:
            stmt = stmt.where(OcorrenciaSanitaria.latitude <= max_lat)
        if min_lon is not None:
            stmt = stmt.where(OcorrenciaSanitaria.longitude >= min_lon)
        if max_lon is not None:
            stmt = stmt.where(OcorrenciaSanitaria.longitude <= max_lon)

        result = await session.execute(stmt)
        ocorrencias = result.scalars().all()

        pesos_severidade = {
            "BAIXA": 1.0,
            "MEDIA": 2.0,
            "ALTA": 3.0,
            "CRITICA": 4.0
        }
        grupos: dict[tuple[float, float], dict] = {}

        for oc in ocorrencias:
            coord = (round(float(oc.latitude), 4), round(float(oc.longitude), 4))
            if coord not in grupos:
                grupos[coord] = {
                    "latitude": coord[0],
                    "longitude": coord[1],
                    "intensidade": 0,
                    "peso_severidade": 0.0,
                    "agentes": set()
                }
            grupos[coord]["intensidade"] += 1
            sev = (oc.severidade or "").upper()
            grupos[coord]["peso_severidade"] += pesos_severidade.get(sev, 1.0)
            if oc.agente_identificado:
                grupos[coord]["agentes"].add(oc.agente_identificado)

        pontos = [
            MapaCalorPontoResponse(
                latitude=g["latitude"],
                longitude=g["longitude"],
                intensidade=g["intensidade"],
                peso_severidade=round(g["peso_severidade"], 2),
                agentes=sorted(list(g["agentes"]))
            )
            for g in grupos.values()
        ]

        return MapaCalorResponse(
            total_pontos=len(pontos),
            total_ocorrencias=len(ocorrencias),
            pontos=pontos
        )
