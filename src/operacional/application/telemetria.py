from datetime import datetime, timezone
from typing import Any
import random


class TelemetriaService:
    @staticmethod
    def obter_posicoes_ao_vivo() -> list[dict[str, Any]]:
        """
        Retorna telemetria ativa da frota em tempo real:
        coordenadas georreferenciadas, velocidade de deslocamento, consumo instantâneo,
        pressão de barra de pulverização e diagnóstico de risco de deriva.
        """
        agora = datetime.now(timezone.utc).isoformat()

        maquinas_telemetria = [
            {
                "codigo": "TR-01",
                "nome": "John Deere 8370R",
                "tipo": "TRATOR",
                "status": "OPERANDO",
                "talhao_atual": "Talhão 02 — Pivô Central",
                "operador": "Carlos Eduardo",
                "posicao": {"x": 340, "y": 180, "lat": -12.5042, "lon": -55.7025},
                "rumo_graus": 178,
                "velocidade_kmh": round(random.uniform(7.0, 7.8), 1),
                "consumo_lh": round(random.uniform(17.8, 18.6), 1),
                "consumo_l_ha": 3.4,
                "rpm": random.randint(1820, 1860),
                "temperatura_motor_c": 88,
                "nivel_diesel_percent": 74,
                "alerta_critico": None,
                "atualizado_em": agora,
            },
            {
                "codigo": "TR-02",
                "nome": "Case IH Magnum 380",
                "tipo": "TRATOR",
                "status": "OPERANDO",
                "talhao_atual": "Talhão 01 — Sede",
                "operador": "Marcos Roberto",
                "posicao": {"x": 140, "y": 160, "lat": -12.5015, "lon": -55.6980},
                "rumo_graus": 355,
                "velocidade_kmh": round(random.uniform(8.0, 8.6), 1),
                "consumo_lh": round(random.uniform(21.5, 23.0), 1),
                "consumo_l_ha": 4.1,
                "rpm": random.randint(1900, 1950),
                "temperatura_motor_c": 91,
                "nivel_diesel_percent": 82,
                "alerta_critico": None,
                "atualizado_em": agora,
            },
            {
                "codigo": "PV-01",
                "nome": "Jacto Uniport 3030",
                "tipo": "PULVERIZADOR",
                "status": "OPERANDO",
                "talhao_atual": "Talhão 04 — Curva do Rio",
                "operador": "Carlos M.",
                "posicao": {"x": 750, "y": 200, "lat": -12.5085, "lon": -55.7140},
                "rumo_graus": 88,
                "velocidade_kmh": round(random.uniform(13.5, 15.2), 1),
                "consumo_lh": round(random.uniform(15.0, 16.2), 1),
                "consumo_l_ha": 1.2,
                "rpm": 1780,
                "temperatura_motor_c": 86,
                "nivel_diesel_percent": 65,
                "pressao_barra_bar": 3.8,
                "vazao_l_ha": 110,
                "alerta_critico": "Risco de Deriva se velocidade ultrapassar 16 km/h",
                "atualizado_em": agora,
            },
            {
                "codigo": "CH-01",
                "nome": "John Deere S790",
                "tipo": "COLHEITADEIRA",
                "status": "PATIO",
                "talhao_atual": "Pátio Central — Manutenção",
                "operador": "Standby",
                "posicao": {"x": 480, "y": 360, "lat": -12.5030, "lon": -55.7000},
                "rumo_graus": 0,
                "velocidade_kmh": 0.0,
                "consumo_lh": 0.0,
                "consumo_l_ha": 0.0,
                "rpm": 0,
                "temperatura_motor_c": 32,
                "nivel_diesel_percent": 95,
                "alerta_critico": None,
                "atualizado_em": agora,
            },
        ]
        return maquinas_telemetria
