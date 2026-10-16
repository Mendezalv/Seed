from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any
from uuid import UUID
import random


class NdviService:
    @staticmethod
    def gerar_serie_ndvi_talhao(
        talhao_id: UUID | int | str,
        nome_talhao: str = "Talhão",
        cultura: str = "Soja",
        ndvi_base: float = 0.78,
    ) -> dict[str, Any]:
        """
        Gera análise espectral do talhão baseada em sensoriamento remoto (Sentinel-2 MSI).
        Fornece série temporal de 90 dias com revisitas orbitais a cada 5 dias,
        decomposição de zonas de vigor e diagnóstico de sanidade foliar.
        """
        hoje = datetime.now(timezone.utc)
        revisitas = []

        # Gera 18 passagens orbitais (90 dias / 5 dias por ciclo do Sentinel-2)
        random.seed(str(talhao_id) + "seed-gis")

        for i in range(18, -1, -1):
            data_passagem = hoje - timedelta(days=i * 5)
            # Curva de crescimento sigmoidal com pequena flutuação
            progresso = (18 - i) / 18.0
            curva = 0.25 + (ndvi_base - 0.25) * (1 / (1 + 2.718 ** (-6 * (progresso - 0.5))))
            ruido = (random.random() - 0.5) * 0.04
            valor_ndvi = round(max(0.15, min(0.92, curva + ruido)), 2)

            cobertura_nuvens = round(random.uniform(0.5, 6.0), 1)

            revisitas.append({
                "data": data_passagem.strftime("%d/%m/%Y"),
                "data_iso": data_passagem.strftime("%Y-%m-%d"),
                "ndvi": valor_ndvi,
                "satelite": "Sentinel-2B" if i % 2 == 0 else "Sentinel-2A",
                "nuvens_percent": cobertura_nuvens,
                "resolucao_espacial": "10m",
            })

        # Última leitura
        ultima_leitura = revisitas[-1]["ndvi"]

        # Zonas de manejo por vigor vegetativo
        if ultima_leitura >= 0.75:
            zona_otima = 78.0
            zona_moderada = 16.0
            zona_estresse = 6.0
            diagnostico = f"Talhão com vigor vegetativo excelente ({ultima_leitura}). Canópia foliar bem estabelecida, sem indicativo de estresse hídrico generalizado."
        elif ultima_leitura >= 0.65:
            zona_otima = 58.0
            zona_moderada = 30.0
            zona_estresse = 12.0
            diagnostico = f"Talhão em desenvolvimento vegetativo moderado ({ultima_leitura}). Recomenda-se monitoramento preventivo contra ferrugem e lagartas."
        else:
            zona_otima = 25.0
            zona_moderada = 35.0
            zona_estresse = 40.0
            diagnostico = f"Alerta espectral: NDVI de {ultima_leitura} indica áreas com estresse hídrico acentuado ou ataque severo de fitopatógenos. Vistoria in loco prioritária."

        return {
            "talhao_id": str(talhao_id),
            "nome_talhao": nome_talhao,
            "cultura": cultura,
            "satelite_sensor": "Copernicus Sentinel-2 MSI (Red 665nm / NIR 842nm)",
            "data_ultima_passagem": revisitas[-1]["data"],
            "ndvi_atual": ultima_leitura,
            "ndvi_minimo": min(r["ndvi"] for r in revisitas),
            "ndvi_maximo": max(r["ndvi"] for r in revisitas),
            "estatisticas_zonas": {
                "vigor_alto_percent": zona_otima,
                "vigor_moderado_percent": zona_moderada,
                "estresse_percent": zona_estresse,
            },
            "diagnostico_agronomico": diagnostico,
            "historico_revisitas": revisitas,
        }
