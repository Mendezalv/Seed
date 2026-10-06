from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.epidemiologico.domain.models import OcorrenciaSanitaria, AlertaEpidemiologico
from src.epidemiologico.domain.schemas import OcorrenciaSanitariaCreate
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
    async def obter_mapa_calor(propriedade_id: UUID, session: AsyncSession) -> list[dict]:
        # Retorna agregacoes para heatmap
        stmt = select(
            OcorrenciaSanitaria.latitude,
            OcorrenciaSanitaria.longitude,
            func.count(OcorrenciaSanitaria.id).label('quantidade')
        ).where(
            OcorrenciaSanitaria.propriedade_id == propriedade_id
        ).group_by(OcorrenciaSanitaria.latitude, OcorrenciaSanitaria.longitude)
        
        result = await session.execute(stmt)
        data = []
        for row in result:
            data.append({
                "latitude": row.latitude,
                "longitude": row.longitude,
                "intensidade": row.quantidade
            })
        return data
