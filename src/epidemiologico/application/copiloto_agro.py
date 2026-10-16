from typing import Any
import re


BASE_CONHECIMENTO_AGROFIT = [
    {
        "alvo": "ferrugem asiática",
        "nome_cientifico": "Phakopsora pachyrhizi",
        "cultura": "Soja",
        "principios_ativos": ["Azoxistrobina + Ciproconazol", "Trifloxistrobina + Protioconazol", "Mancozebe (Multissítio)"],
        "produtos_comerciais": ["Fox Xpro", "Priori Xtra", "Opera Ultra", "Unizeb Gold"],
        "dosagem_recomendada": "0,4 a 0,5 L/ha (associado a 1,5 kg/ha de multissítio protetor)",
        "carencia_dias": 30,
        "grupo_quimico": "Triazol + Estrobirulina + Carboxamida (FRAC 3, 11, 7)",
        "condicoes_climaticas": "Aplicar preventivamente no fechamento de entrelinhas (V6/R1) com UR > 55% e temperatura < 30°C.",
        "recomendacao_manejo": "Obrigatório o uso de fungicida multissítio (Mancozebe ou Clorotalonil) em tanque para preservar a eficácia dos sítio-específicos e mitigar resistência genética fúngica.",
    },
    {
        "alvo": "percevejo-marrom",
        "nome_cientifico": "Euschistus heros",
        "cultura": "Soja",
        "principios_ativos": ["Acefato", "Tiametoxam + Lambda-Cialotrina", "Dinotefurano"],
        "produtos_comerciais": ["Engeo Pleno S", "Orthene 750 BR", "Venom"],
        "dosagem_recomendada": "0,2 a 0,25 L/ha (Engeo) ou 0,7 a 1,0 kg/ha (Acefato)",
        "carencia_dias": 21,
        "grupo_quimico": "Neonicotinoide + Piretroide (IRAC 4A, 3A) / Organofosforado (IRAC 1B)",
        "condicoes_climaticas": "Atingir o terço médio da planta. Janela ideal: início da manhã ou final de tarde (temperaturas amenas).",
        "recomendacao_manejo": "Nível de controle econômico: 2 percevejos por pano de batida em grãos comerciais, ou 1 percevejo/pano em campos de produção de sementes.",
    },
    {
        "alvo": "lagarta-falsa-medideira",
        "nome_cientifico": "Chrysodeixis includens",
        "cultura": "Soja / Algodão",
        "principios_ativos": ["Clorantraniliprole", "Metomil", "Bacillus thuringiensis"],
        "produtos_comerciais": ["Premio", "Lannate BR", "Dipel"],
        "dosagem_recomendada": "50 a 100 mL/ha (Premio) ou 0,5 a 1,0 L/ha (Biológico BT)",
        "carencia_dias": 14,
        "grupo_quimico": "Diamida Antranílica (IRAC 28) / Biológico Microbiológico",
        "condicoes_climaticas": "Excelente perfil seletivo a inimigos naturais. Aplicar quando a desfolha atingir 30% em vegetativo ou 15% em reprodutivo.",
        "recomendacao_manejo": "Priorizar inseticidas fisiológicos ou biológicos nas primeiras aplicações para preservar parasitoides de ovos (Trichogramma).",
    },
    {
        "alvo": "cigarrinha-do-milho",
        "nome_cientifico": "Dalbulus maidis",
        "cultura": "Milho",
        "principios_ativos": ["Beauveria bassiana", "Imidacloprido + Bifentrina", "Espinetoram"],
        "produtos_comerciais": ["Boveril", "Galil SC", "Exalt"],
        "dosagem_recomendada": "0,3 a 0,5 L/ha associado a tratamento de sementes industrial",
        "carencia_dias": 15,
        "grupo_quimico": "Biológico Fúngico + Neonicotinoide (IRAC 4A)",
        "condicoes_climaticas": "Janela crítica de V1 a V8. A calda deve atingir o cartucho do milho.",
        "recomendacao_manejo": "Vetor de molicutes (enfezamento pálido e vermelho) e virose do raiado fino. Sincronizar época de plantio e eliminar milho tiguera.",
    },
    {
        "alvo": "buva resistente",
        "nome_cientifico": "Conyza bonariensis / Conyza sumatrensis",
        "cultura": "Soja / Milho (Manejo de dessecação pré-plantio)",
        "principios_ativos": ["Glufosinato de Amônio", "2,4-D Colina", "Diquate", "Flumioxazina"],
        "produtos_comerciais": ["Finale", "Enlist Colex-D", "Reglone", "Flumyzin"],
        "dosagem_recomendada": "2,0 L/ha (Glufosinato) ou 1,5 L/ha (2,4-D) em aplicação sequencial",
        "carencia_dias": 10,
        "grupo_quimico": "Inibidor da GS (HRAC 10) / Mimetizador de auxina (HRAC 4)",
        "condicoes_climaticas": "Aplicar em buva pequena (até 8 a 10 cm / 4 folhas) com umidade relativa superior a 60%.",
        "recomendacao_manejo": "Sistema de dessecação sequencial obrigatório: 1ª aplicação sistêmica (ex: Glifosato + 2,4-D) seguida de aplicação de contato 7 a 10 dias depois (Glufosinato ou Diquate).",
    },
]


class CopilotoAgroService:
    @staticmethod
    def responder_consulta(
        pergunta: str,
        cultura: str = "Soja",
        talhao_nome: str | None = None,
        insumos_estoque: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Processa consultas técnicas de agrônomos e produtores, retornando
        recomendações fundamentadas nas bulas do Agrofit / MAPA e boas práticas agrícolas.
        """
        texto_limpo = pergunta.lower()

        # Busca na base fitossanitária
        alvo_encontrado = None
        for item in BASE_CONHECIMENTO_AGROFIT:
            alvo_tokens = item["alvo"].lower().split()
            if any(token in texto_limpo for token in alvo_tokens) or item["nome_cientifico"].lower() in texto_limpo:
                alvo_encontrado = item
                break

        if not alvo_encontrado:
            # Fallback inteligente com orientações gerais do MAPA
            return {
                "encontrado": False,
                "tema": "Manejo Integrado de Pragas & Fitopatologia Geral",
                "resposta": (
                    f"Para a cultura de **{cultura}**, a recomendação técnica padrão do Ministério da Agricultura (MAPA) "
                    "orienta realizar o monitoramento semanal por amostragem georreferenciada antes de qualquer entrada curativa com defensivos. "
                    "Recomenda-se aferir a velocidade do vento (3 a 10 km/h), umidade relativa (>55%) e temperatura (<30°C) "
                    "para mitigar risco de deriva e evaporação de gotas em tanque."
                ),
                "alerta_seguranca": "Consulte o receituário agronômico emitido por Engenheiro Agrônomo responsável antes da aplicação.",
                "referencias": ["Agrofit / MAPA 2026", "Embrapa Soja / Milho", "Comitê de Ação a Resistência a Fungicidas (FRAC-BR)"],
            }

        # Cruzamento com estoque da fazenda se disponível
        insumos_disponiveis = []
        if insumos_estoque:
            for ins in insumos_estoque:
                for prod in alvo_encontrado["produtos_comerciais"]:
                    if prod.lower() in ins.lower():
                        insumos_disponiveis.append(ins)

        mensagem_estoque = ""
        if insumos_disponiveis:
            mensagem_estoque = f"\n\n📦 **Disponível no seu estoque:** {', '.join(insumos_disponiveis)} pronto para uso imediato."

        resposta_formatada = (
            f"### Diagnóstico Fitossanitário: {alvo_encontrado['alvo'].title()} (*{alvo_encontrado['nome_cientifico']}*)\n\n"
            f"**Cultura Indicada:** {alvo_encontrado['cultura']}\n"
            f"**Princípios Ativos Registrados (Agrofit):** {', '.join(alvo_encontrado['principios_ativos'])}\n"
            f"**Produtos Comerciais de Referência:** {', '.join(alvo_encontrado['produtos_comerciais'])}\n"
            f"**Dosagem Recomendada em Bula:** {alvo_encontrado['dosagem_recomendada']}\n"
            f"**Período de Carência:** {alvo_encontrado['carencia_dias']} dias antes da colheita\n"
            f"**Mecanismo de Ação (Resistência):** {alvo_encontrado['grupo_quimico']}\n\n"
            f"💡 **Recomendação de Manejo:** {alvo_encontrado['recomendacao_manejo']}\n"
            f"🌦️ **Condições Climáticas Ideais:** {alvo_encontrado['condicoes_climaticas']}"
            f"{mensagem_estoque}"
        )

        return {
            "encontrado": True,
            "alvo": alvo_encontrado["alvo"],
            "nome_cientifico": alvo_encontrado["nome_cientifico"],
            "cultura": alvo_encontrado["cultura"],
            "resposta": resposta_formatada,
            "principios_ativos": alvo_encontrado["principios_ativos"],
            "dosagem": alvo_encontrado["dosagem_recomendada"],
            "carencia_dias": alvo_encontrado["carencia_dias"],
            "alerta_seguranca": f"Respeitar rigorosamente o período de carência de {alvo_encontrado['carencia_dias']} dias e utilizar EPI completo na calda.",
            "referencias": [
                f"Agrofit MAPA nº registro oficial ({alvo_encontrado['alvo']})",
                "Embrapa Agropecuária",
                "FRAC / HRAC / IRAC Brasil",
            ],
        }
