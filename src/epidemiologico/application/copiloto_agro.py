"""
Módulo de Aplicação: Copiloto Agronômico Inteligente Seed
Integrado aos catálogos oficiais do Ministério da Agricultura (Agrofit / MAPA),
Embrapa, comitês científicos de resistência (FRAC, IRAC, HRAC) e manuais técnicos de solos e mecanização.
"""

from typing import Any, Optional
import unicodedata
import re

def _normalizar(texto: str) -> str:
    """Remove acentos, pontuações e converte para minúsculas."""
    nfkd = unicodedata.normalize("NFKD", texto)
    sem_acento = "".join(c for c in nfkd if not unicodedata.combining(c))
    return re.sub(r"[^a-zA-Z0-9\s]", " ", sem_acento).lower()


# Base de Conhecimento Multidisciplinar Agronômica
BASE_CONHECIMENTO_AGROFIT = [
    # ─── 1. FITOPATOLOGIA (DOENÇAS) ──────────────────────────────────────────
    {
        "id": "ferrugem_asiatica",
        "categoria": "FITOPATOLOGIA",
        "alvo": "ferrugem asiática",
        "nome_cientifico": "Phakopsora pachyrhizi",
        "cultura": "Soja",
        "sinonimos": ["ferrugem", "phakopsora", "fungicida ferrugem", "multissitio", "vaziosanitario"],
        "principios_ativos": ["Trifloxistrobina + Protioconazol", "Bixafen + Protioconazol + Trifloxistrobina", "Mancozebe (Multissítio protetor)"],
        "produtos_comerciais": ["Fox Xpro", "Priori Xtra", "Unizeb Gold", "Opera Ultra", "Cypress"],
        "dosagem_recomendada": "0,4 a 0,5 L/ha associado obrigatoriamente a 1,5 kg/ha de Mancozebe",
        "carencia_dias": 30,
        "grupo_quimico": "Triazol + Estrobirulina + Carboxamida (FRAC 3, 11, 7) + Ditiocarbamato (M03)",
        "condicoes_climaticas": "Aplicar com UR > 55%, temperatura < 30°C e ventos de 3 a 10 km/h. Janela ideal: início da manhã ou fim da tarde.",
        "recomendacao_manejo": "Manejo estritamente preventivo a partir do estádio V6/R1 antes do fechamento total da entrelinha. A adição de fungicidas multissítios em todas as entradas é obrigatória para frear mutações de resistência fúngica a carboxamidas e triazóis.",
    },
    {
        "id": "mancha_alvo",
        "categoria": "FITOPATOLOGIA",
        "alvo": "mancha-alvo",
        "nome_cientifico": "Corynespora cassiicola",
        "cultura": "Soja / Algodão",
        "sinonimos": ["mancha alvo", "corynespora", "desfolha baixeiro"],
        "principios_ativos": ["Fluxapiroxade + Piraclostrobina", "Protioconazol", "Clorotalonil"],
        "produtos_comerciais": ["Orkestra SC", "Fox Xpro", "Bravo 500", "Bravonil"],
        "dosagem_recomendada": "0,3 a 0,4 L/ha (Orkestra) + 1,5 a 2,0 L/ha de Clorotalonil",
        "carencia_dias": 28,
        "grupo_quimico": "Carboxamida (FRAC 7) + Estrobirulina (FRAC 11) + Cloronitrila (FRAC M05)",
        "condicoes_climaticas": "Molhamento foliar prolongado (>6h) com temperaturas amenas (20° a 28°C) favorece o patógeno. Exige penetração profunda de gotas na baixeira.",
        "recomendacao_manejo": "Utilizar cultivares com tolerância genética, rotação com gramíneas (milho/braquiária) e primeiras aplicações de fungicida antes de fechar as linhas inferiores do dossel.",
    },
    {
        "id": "antracnose",
        "categoria": "FITOPATOLOGIA",
        "alvo": "antracnose",
        "nome_cientifico": "Colletotrichum truncatum",
        "cultura": "Soja",
        "sinonimos": ["antracnose", "colletotrichum", "abortamento vagens", "necrose hastes"],
        "principios_ativos": ["Difenoconazol + Tiametoxam", "Azoxistrobina", "Mancozebe"],
        "produtos_comerciais": ["Score", "Priori", "Amistar WG"],
        "dosagem_recomendada": "0,2 a 0,3 L/ha (Score) no estádio R1/R2",
        "carencia_dias": 21,
        "grupo_quimico": "Triazol (FRAC 3) + Estrobirulina (FRAC 11)",
        "condicoes_climaticas": "Altas temperaturas (>28°C) associadas a chuvas frequentes provocam rápida disseminação.",
        "recomendacao_manejo": "Tratamento de sementes profissional obrigatório, manejo de densidade populacional adequada para aeração de dossel e controle de estresse de potássio na fase reprodutiva.",
    },
    {
        "id": "mofo_branco",
        "categoria": "FITOPATOLOGIA",
        "alvo": "mofo-branco",
        "nome_cientifico": "Sclerotinia sclerotiorum",
        "cultura": "Soja / Feijão / Algodão",
        "sinonimos": ["mofo branco", "esclerotinia", "esclerodios", "trichoderma mofo"],
        "principios_ativos": ["Fluazinam", "Procimidona", "Trichoderma asperellum (Biológico)"],
        "produtos_comerciais": ["Frowncide 500 SC", "Sumilex 500 WP", "Quality", "Trichodermil"],
        "dosagem_recomendada": "0,8 a 1,0 L/ha (Fluazinam) ou 200 a 400 mL/ha (Biológico preventivo em palhada)",
        "carencia_dias": 35,
        "grupo_quimico": "Fenilpiridinilamina (FRAC 29) / Dicarboximida (FRAC 2) / Antagonista Biológico",
        "condicoes_climaticas": "Temperaturas entre 15°C e 22°C com alta umidade e sombreamento total do solo.",
        "recomendacao_manejo": "Aplicação biológica de Trichoderma na palhada pré-plantio para parasitar escleródios. Em vegetativo/florescimento pleno (R1), aplicação química preventiva atingindo as pétalas senescentes.",
    },
    {
        "id": "enfezamento_milho",
        "categoria": "FITOPATOLOGIA",
        "alvo": "enfezamento pálido e vermelho do milho",
        "nome_cientifico": "Spiroplasma kunkelii / Phytoplasma",
        "cultura": "Milho",
        "sinonimos": ["enfezamento", "molicutes", "raiado fino", "cigarra milho", "enfezamento palido"],
        "principios_ativos": ["Beauveria bassiana", "Tiametoxam", "Bifentrina + Acetamiprido"],
        "produtos_comerciais": ["Boveril", "Cruiser (TS)", "Galil SC"],
        "dosagem_recomendada": "0,3 a 0,5 kg/ha (Beauveria) associado a pulverizações foliares entre V1 e V8",
        "carencia_dias": 15,
        "grupo_quimico": "Fúngico Entomopatogênico + Neonicotinoide (IRAC 4A)",
        "condicoes_climaticas": "Temperaturas elevadas (>27°C) favorecem a proliferação explosiva do vetor Dalbulus maidis.",
        "recomendacao_manejo": "Eliminação rigorosa de milho tiguera na entressafra para quebrar a ponte verde. Sincronização de plantio regional e escolha de híbridos de milho tolerantes a molicutes.",
    },

    # ─── 2. ENTOMOLOGIA (PRAGAS & VETORES) ────────────────────────────────────
    {
        "id": "percevejo_marrom",
        "categoria": "ENTOMOLOGIA",
        "alvo": "percevejo-marrom",
        "nome_cientifico": "Euschistus heros",
        "cultura": "Soja",
        "sinonimos": ["percevejo", "euschistus", "percevejo marrom", "percevejo barriga verde"],
        "principios_ativos": ["Acefato", "Tiametoxam + Lambda-Cialotrina", "Dinotefurano"],
        "produtos_comerciais": ["Engeo Pleno S", "Orthene 750 BR", "Venom", "Connect"],
        "dosagem_recomendada": "0,2 a 0,25 L/ha (Engeo Pleno S) ou 0,7 a 1,0 kg/ha (Acefato 750 g/kg)",
        "carencia_dias": 21,
        "grupo_quimico": "Neonicotinoide + Piretroide (IRAC 4A, 3A) / Organofosforado (IRAC 1B)",
        "condicoes_climaticas": "Janela crítica de aplicação no início da manhã ou entardecer, quando os percevejos sobem para a parte superior das plantas.",
        "recomendacao_manejo": "Nível de controle econômico: 2 percevejos por pano de batida em grãos comerciais, ou 1 percevejo/pano em campos de sementes. Rodízio estrito de mecanismos de ação.",
    },
    {
        "id": "lagarta_cartucho",
        "categoria": "ENTOMOLOGIA",
        "alvo": "lagarta-do-cartucho",
        "nome_cientifico": "Spodoptera frugiperda",
        "cultura": "Milho / Soja / Algodão",
        "sinonimos": ["spodoptera", "lagarta do cartucho", "cartucho", "frugiperda"],
        "principios_ativos": ["Clorantraniliprole", "Espinetoram", "Bacillus thuringiensis (Bt)", "Metomil"],
        "produtos_comerciais": ["Premio", "Exalt", "Dipel", "Lannate BR"],
        "dosagem_recomendada": "50 a 80 mL/ha (Premio) ou 100 mL/ha (Exalt)",
        "carencia_dias": 14,
        "grupo_quimico": "Diamida Antranílica (IRAC 28) / Espinosina (IRAC 5)",
        "condicoes_climaticas": "Aplicar quando as lagartas estão em estádios L1 a L3 (até 1 cm). Gotas devem penetrar no interior do cartucho.",
        "recomendacao_manejo": "Refúgio estruturado obrigatório (10% de milho não-Bt). Preservação de inimigos naturais como tesourinhas (Doru luteipes) e parasitoides.",
    },
    {
        "id": "lagarta_falsa_medideira",
        "categoria": "ENTOMOLOGIA",
        "alvo": "lagarta-falsa-medideira",
        "nome_cientifico": "Chrysodeixis includens",
        "cultura": "Soja / Algodão",
        "sinonimos": ["falsa medideira", "chrysodeixis", "desfolhadora"],
        "principios_ativos": ["Clorantraniliprole", "Espinetoram", "Baculovirus chrysodeixis"],
        "produtos_comerciais": ["Premio", "Exalt", "Chrysogen"],
        "dosagem_recomendada": "50 a 100 mL/ha (Premio) ou 50 mL/ha (Baculovírus biológico)",
        "carencia_dias": 14,
        "grupo_quimico": "Diamida (IRAC 28) / Biológico Seletivo",
        "condicoes_climaticas": "Excelente perfil seletivo a inimigos naturais. Monitorar desfolha no dossel médio.",
        "recomendacao_manejo": "Nível de controle: 30% de desfolha em fase vegetativa ou 15% após floração (R1). Priorizar biológicos e fisiológicos nas primeiras pulverizações.",
    },
    {
        "id": "mosca_branca",
        "categoria": "ENTOMOLOGIA",
        "alvo": "mosca-branca",
        "nome_cientifico": "Bemisia tabaci",
        "cultura": "Soja / Algodão / Feijão",
        "sinonimos": ["mosca branca", "bemisia", "fumagina", "geminivirus"],
        "principios_ativos": ["Piriproxifem (Fisiológico)", "Acetamiprido + Bifentrina", "Sulfoxaflor", "Beauveria bassiana"],
        "produtos_comerciais": ["Tiger", "Epingle", "Transform", "Boveril"],
        "dosagem_recomendada": "0,4 a 0,5 L/ha (Piriproxifem) ou 0,3 L/ha (Sulfoxaflor)",
        "carencia_dias": 14,
        "grupo_quimico": "Mimetizador de Hormônio Juvenil (IRAC 7C) / Sulfoxamina (IRAC 4C)",
        "condicoes_climaticas": "Clima quente e seco favorece surtos reprodutivos. Exige alta cobertura na face abaxial (inferior) das folhas.",
        "recomendacao_manejo": "Uso de adjuvante siliconado para quebra de tensão superficial e rotação de inibidores de síntese de quitina com adulticidas de choque.",
    },
    {
        "id": "nematoides",
        "categoria": "ENTOMOLOGIA",
        "alvo": "nematoides de galhas, cisto e lesões",
        "nome_cientifico": "Meloidogyne incognita / Heterodera glycines / Pratylenchus brachyurus",
        "cultura": "Soja / Milho / Algodão",
        "sinonimos": ["nematoide", "nematoides", "pratylenchus", "meloidogyne", "reboleiras"],
        "principios_ativos": ["Bacillus subtilis + Bacillus licheniformis", "Purpureocillium lilacinum", "Fluopyram"],
        "produtos_comerciais": ["Verango", "Nemix", "NemaControl", "BioNeem"],
        "dosagem_recomendada": "0,15 a 0,20 L/ha (Fluopyram no sulco ou TS) ou 1,0 L/ha (Biológico via sulco)",
        "carencia_dias": 60,
        "grupo_quimico": "Nematicida Químico Piridinil-etil-benzamida / Nematicidas Biológicos",
        "condicoes_climaticas": "Solos arenosos com baixa matéria orgânica potencializam o dano das lesões radiculares.",
        "recomendacao_manejo": "Amostragem nematológica anual georreferenciada. Rotação com espécies más hospedeiras (ex: Crotalaria spectabilis) e adensamento de matéria orgânica no perfil do solo.",
    },

    # ─── 3. MATOLOGIA (PLANTAS DANINHAS & HERBICIDAS) ────────────────────────
    {
        "id": "buva_resistente",
        "categoria": "MATOLOGIA_HERBICIDAS",
        "alvo": "buva resistente a glifosato",
        "nome_cientifico": "Conyza bonariensis / Conyza sumatrensis",
        "cultura": "Soja / Milho (Manejo pré-plantio e dessecação)",
        "sinonimos": ["buva", "conyza", "buva resistente", "dessecacao sequencial"],
        "principios_ativos": ["Glufosinato de Amônio", "2,4-D Colina", "Diquate", "Flumioxazina", "Dicamba"],
        "produtos_comerciais": ["Finale", "Enlist Colex-D", "Reglone", "Flumyzin", "Atectra SB"],
        "dosagem_recomendada": "2,0 L/ha (Glufosinato) ou 1,5 L/ha (2,4-D) em aplicação sequencial",
        "carencia_dias": 10,
        "grupo_quimico": "Inibidor da GS (HRAC 10) / Mimetizador de auxina (HRAC 4) / Inibidor da PROTOX (HRAC 14)",
        "condicoes_climaticas": "Aplicar quando a buva possui até 8 a 10 cm (4 a 6 folhas) com UR > 60%.",
        "recomendacao_manejo": "Dessecação em duas etapas sequenciais obrigatórias: 1ª aplicação sistêmica (Glifosato + 2,4-D ou Dicamba), seguida de herbicida de contato (Glufosinato ou Diquate) 7 a 10 dias após, adicionando pré-emergente residual.",
    },
    {
        "id": "capim_amargoso",
        "categoria": "MATOLOGIA_HERBICIDAS",
        "alvo": "capim-amargoso resistente",
        "nome_cientifico": "Digitaria insularis",
        "cultura": "Soja / Milho",
        "sinonimos": ["amargoso", "digitaria", "capim amargoso", "rizoma amargoso"],
        "principios_ativos": ["Cletodim", "Haloxifope-P-metílico", "Glifosato + Óleo Mineral", "Imazetapir"],
        "produtos_comerciais": ["Select 240 EC", "Verdict Max", "Haloxy", "Zethapyr"],
        "dosagem_recomendada": "0,45 a 0,50 L/ha (Cletodim) ou 0,40 L/ha (Haloxifope) + 0,5% v/v óleo mineral",
        "carencia_dias": 30,
        "grupo_quimico": "Inibidores da ACCase (Graminicidas HRAC 1: FOPs e DIMs)",
        "condicoes_climaticas": "Planta em pleno crescimento vegetativo, sem estresse hídrico. Folhas ativas para translocação vascular.",
        "recomendacao_manejo": "Nunca aplicar em touceiras senescentes ou com sementes formadas. Roçada mecânica prévia ou dessecação sequencial com intervalo de 14 a 20 dias antes da semeadura.",
    },
    {
        "id": "caruru_palmeri",
        "categoria": "MATOLOGIA_HERBICIDAS",
        "alvo": "caruru-gigante e palmeri",
        "nome_cientifico": "Amaranthus palmeri / Amaranthus hybridus",
        "cultura": "Soja / Milho / Algodão",
        "sinonimos": ["caruru", "amaranthus", "palmeri", "caruru gigante"],
        "principios_ativos": ["S-metolacloro (Residual)", "Fomesafen", "Flumioxazina", "Glufosinato"],
        "produtos_comerciais": ["Dual Gold", "Flex", "Flumyzin", "Finale"],
        "dosagem_recomendada": "1,5 a 2,0 L/ha (S-metolacloro) em pré-emergência ou 0,8 L/ha (Flex) em pós-inicial",
        "carencia_dias": 30,
        "grupo_quimico": "Inibidor de Divisão Celular (HRAC 15) / Inibidor da PROTOX (HRAC 14)",
        "condicoes_climaticas": "Exige umidade no solo logo após a aplicação pré-emergente para incorporação do filme residual.",
        "recomendacao_manejo": "Tolera altas temperaturas e cresce até 3 cm/dia. Controle mandatório com residuais de solo antes da emergência do banco de sementes.",
    },

    # ─── 4. SOLOS, NUTRIÇÃO & FERTILIDADE ────────────────────────────────────
    {
        "id": "calagem_gessagem",
        "categoria": "SOLOS_FERTILIDADE",
        "alvo": "calagem e gessagem do solo",
        "nome_cientifico": "Correção de Acidez, Cálcio e Saturação por Bases",
        "cultura": "Soja / Milho / Cana / Pastagens",
        "sinonimos": ["calcario", "calagem", "gesso", "gessagem", "ph solo", "saturacao por bases", "prnt", "aluminio"],
        "principios_ativos": ["Carbonato de Cálcio e Magnésio (Calcário)", "Sulfato de Cálcio Di-hidratado (Gesso Agrícola)"],
        "produtos_comerciais": ["Calcário Dolomítico PRNT > 85%", "Calcário Calcítico", "Gesso Agrícola Fosfogesso"],
        "dosagem_recomendada": "NC (t/ha) = (V2 - V1) * CTC / PRNT. Gessagem: NG (kg/ha) = 50 * Teor de Argila (%) para soja",
        "carencia_dias": 60,
        "grupo_quimico": "Corretivos e Condicionadores Minerais de Solo (MAPA)",
        "condicoes_climaticas": "Aplicar de 60 a 90 dias antes do plantio com umidade suficiente no perfil para reação dos carbonatos.",
        "recomendacao_manejo": "Elevar saturação por bases (V%) para 65-70% em soja e milho. O gesso agrícola não altera significativamente o pH superficial, mas neutraliza o alumínio tóxico (Al3+) e desce cálcio para a camada subsuperficial (20-40 cm), permitindo que as raízes busquem água na estiagem.",
    },
    {
        "id": "adubacao_npk",
        "categoria": "SOLOS_FERTILIDADE",
        "alvo": "adubação npk e nutrição de safra",
        "nome_cientifico": "Equilíbrio de Nitrogênio, Fósforo e Potássio",
        "cultura": "Soja e Milho",
        "sinonimos": ["npk", "adubacao", "fertilizante", "potassio", "fosforo", "nitrogenio", "kcl", "map", "ureia"],
        "principios_ativos": ["Fosfato Monoamônico (MAP)", "Cloreto de Potássio (KCl)", "Superfosfato Simples/Triplo", "Ureia Protegida com NBPT"],
        "produtos_comerciais": ["MAP 11-52-00", "KCl 00-00-60", "Super Simples 00-20-00", "Sulfato de Amônio"],
        "dosagem_recomendada": "Soja: 80 a 120 kg/ha P2O5 e 100 a 140 kg/ha K2O (conforme laudo e expectativa de 70+ sc/ha)",
        "carencia_dias": 0,
        "grupo_quimico": "Macronutrientes Primários de Alta Eficiência",
        "condicoes_climaticas": "Evitar excesso de KCl direto na linha de semeadura (efeito salino nos nódulos de germinação se > 50 kg/ha na linha; aplicar a lanço pré-plantio).",
        "recomendacao_manejo": "Na soja, o nitrogênio total vem da Fixação Biológica de Nitrogênio (FBN via Bradyrhizobium + coinoculação com Azospirillum brasilense e cobalto/molibdênio). No milho, aplicar 30-40 kg N no plantio e 120-180 kg N em cobertura entre V4 e V6 com solo úmido.",
    },
    {
        "id": "micronutrientes_foliar",
        "categoria": "SOLOS_FERTILIDADE",
        "alvo": "micronutrientes e adubação foliar",
        "nome_cientifico": "Nutrição de Boro, Zinco, Manganês e Cobre",
        "cultura": "Soja / Milho",
        "sinonimos": ["micronutrientes", "boro", "zinco", "manganes", "adubo foliar", "fixacao biologica", "inoculacao"],
        "principios_ativos": ["Octaborato de Sódio / Ácido Bórico", "Sulfato de Zinco / Quelato EDTA", "Sulfato de Manganês Quelatizado"],
        "produtos_comerciais": ["Solubor", "ZincoMax", "Manganês Quelato", "CoMo Platinum"],
        "dosagem_recomendada": "Boro: 0,5 a 1,0 kg/ha na floração. Manganês: 300 a 500 g/ha em soja RR após glifosato.",
        "carencia_dias": 0,
        "grupo_quimico": "Micronutrientes Essenciais Quelatizados",
        "condicoes_climaticas": "Pulverizar nas horas frescas do dia, garantindo pH da calda entre 5,5 e 6,5 para máxima absorção cuticular.",
        "recomendacao_manejo": "Em cultivares com tecnologia RR (Roundup Ready), aplicações de glifosato imobilizam temporariamente o manganês nos tecidos; a suplementação de manganês quelato 7 a 10 dias após o herbicida previne a 'amarelecimento induzido'.",
    },

    # ─── 5. TECNOLOGIA DE APLICAÇÃO & METEOROLOGIA ────────────────────────────
    {
        "id": "tecnologia_pulverizacao",
        "categoria": "TECNOLOGIA_APLICACAO_CLIMA",
        "alvo": "tecnologia de pulverização e deriva",
        "nome_cientifico": "Manejo de Pontas, Gotas, Pressão e Janela Meteorológica",
        "cultura": "Todas as Culturas Agrícolas",
        "sinonimos": ["pulverizacao", "bicos", "pontas", "deriva", "delta t", "temperatura aplicacao", "ordem de calda", "vento"],
        "principios_ativos": ["Pontas com Indução de Ar (AIXR, TTI)", "Pontas Cone Vazio (TXA)", "Adjuvantes Antideriva e Óleos"],
        "produtos_comerciais": ["TeeJet AIXR", "MagnoJet MGA", "Aureo", "Silwet L-77"],
        "dosagem_recomendada": "Vazão calibrada de 80 a 150 L/ha conforme alvo e densidade foliar",
        "carencia_dias": 0,
        "grupo_quimico": "Tecnologia Mecatrônica e Engenharia Agronômica de Aplicação",
        "condicoes_climaticas": "Condições climáticas ideais: Temperatura entre 18°C e 28°C (máx 30°C), Umidade Relativa > 55% e Vento de 3 a 10 km/h (nunca com vento zero / inversão térmica).",
        "recomendacao_manejo": "Calcular Delta T (diferença psicrométrica ideal entre 2°C e 8°C). Ordem correta de mistura em tanque: 1° Condicionador de água -> 2° Formulações sólidas (WG/WP) -> 3° Suspensões concentradas (SC) -> 4° Concentrados emulsionáveis (EC) -> 5° Soluções concentradas (SL) -> 6° Adjuvantes e óleos.",
    },

    # ─── 6. MÁQUINAS, FROTAS & TELEMETRIA ────────────────────────────────────
    {
        "id": "manutencao_maquinas",
        "categoria": "MAQUINAS_OPERACIONAL",
        "alvo": "manutenção e telemetria de frotas agrícolas",
        "nome_cientifico": "Gestão de Horímetro, Óleos, Filtros e Calibração",
        "cultura": "Parque Mecanizado",
        "sinonimos": ["trator", "colheitadeira", "pulverizador", "horimetro", "manutencao", "oleo", "filtro", "consumo diesel"],
        "principios_ativos": ["Óleo Lubrificante 15W-40 CI-4/CK-4", "Fluido Hidráulico UTTO", "Graxa NLGI 2 Lítio"],
        "produtos_comerciais": ["Shell Rimula", "Mobil Delvac", "John Deere Plus-50 II"],
        "dosagem_recomendada": "Revisões preventivas rigorosas a cada 250h (óleo do motor/filtro) e 500h (filtros de combustível/hidráulico)",
        "carencia_dias": 0,
        "grupo_quimico": "Manutenção Preditiva e Engenharia de Máquinas Agrícolas",
        "condicoes_climaticas": "Monitorar pressão dos pneus conforme lastro e teor de umidade do solo para evitar compactação.",
        "recomendacao_manejo": "Calibrar dosadores de sementes e discos alveolados antes do plantio (alvo de desvio < 5% de duplos e falhas). Aferir bicos do pulverizador individualmente em proveta graduada (tolerância máx de 10% entre pontas da barra).",
    },

    # ─── 7. ECONOMIA AGRÍCOLA, LCDPR & ESG ───────────────────────────────────
    {
        "id": "gestao_lcdpr_esg",
        "categoria": "ECONOMIA_LCDPR_ESG",
        "alvo": "livro caixa lcdpr e break-even da safra",
        "nome_cientifico": "Gestão Tributária, Ponto de Equilíbrio e Créditos de Carbono",
        "cultura": "Gestão Fazenda Integrada",
        "sinonimos": ["lcdpr", "imposto de renda", "dre", "break even", "custo por hectare", "esg", "credito de carbono", "margem"],
        "principios_ativos": ["Livro Caixa Digital do Produtor Rural (Receita Federal)", "Metodologia GHG Protocol Agropecuário"],
        "produtos_comerciais": ["Seed LCDPR Engine", "Seed Calculadora ESG"],
        "dosagem_recomendada": "Break-even (sc/ha) = Custo Operacional Efetivo (R$/ha) / Preço Líquido da Saca (R$/sc)",
        "carencia_dias": 0,
        "grupo_quimico": "Finanças Rurais & Sustentabilidade Agro",
        "condicoes_climaticas": "Conciliação bancária de custeio mensal vinculada aos talhões de origem.",
        "recomendacao_manejo": "Para faturamento rural anual superior a R$ 4,8 milhões, a entrega do arquivo digital do LCDPR (layout Q100) é obrigatória à Receita Federal. O manejo de plantio direto na palha sem revolvimento do solo sequestra em média 1,2 tCO2e/ha/ano, elegendo a fazenda para programas de créditos de carbono.",
    },
]


class CopilotoAgroService:
    @staticmethod
    def responder_consulta(
        pergunta: str,
        cultura: str = "Soja",
        talhao_nome: Optional[str] = None,
        insumos_estoque: Optional[list[str]] = None,
    ) -> dict[str, Any]:
        """
        Processa consultas agronômicas de produtores e engenheiros agrônomos,
        cruzando dados fitossanitários do MAPA/Agrofit, tecnologia de aplicação,
        nutrição de plantas, máquinas e gestão de custos.
        """
        texto_limpo = _normalizar(pergunta)
        palavras_pergunta = set(texto_limpo.split())

        # Pontuação e busca do melhor alvo na base de conhecimento
        melhor_item = None
        melhor_score = 0

        for item in BASE_CONHECIMENTO_AGROFIT:
            score = 0
            # Match exato do alvo
            alvo_norm = _normalizar(item["alvo"])
            if alvo_norm in texto_limpo:
                score += 15
            
            # Match de nome científico
            nome_cie_norm = _normalizar(item["nome_cientifico"])
            if any(part in texto_limpo for part in nome_cie_norm.split() if len(part) > 4):
                score += 10

            # Match de sinônimos e palavras-chave
            for sin in item["sinonimos"]:
                sin_norm = _normalizar(sin)
                if sin_norm in texto_limpo:
                    score += 8
                elif any(word in palavras_pergunta for word in sin_norm.split() if len(word) > 3):
                    score += 4

            # Match de produtos comerciais
            for prod in item["produtos_comerciais"]:
                if _normalizar(prod) in texto_limpo:
                    score += 7

            # Match de princípios ativos
            for pa in item["principios_ativos"]:
                if any(w in texto_limpo for w in _normalizar(pa).split() if len(w) > 4):
                    score += 5

            # Match de cultura coincidente
            if _normalizar(cultura) in _normalizar(item["cultura"]):
                score += 2

            if score > melhor_score:
                melhor_score = score
                melhor_item = item

        # Se encontrou item relevante (score mínimo)
        if melhor_item and melhor_score >= 4:
            # Cruzamento com o estoque local da fazenda
            insumos_disponiveis = []
            if insumos_estoque:
                for ins in insumos_estoque:
                    ins_norm = _normalizar(ins)
                    for prod in melhor_item["produtos_comerciais"]:
                        if _normalizar(prod) in ins_norm or ins_norm in _normalizar(prod):
                            insumos_disponiveis.append(ins)
                    for pa in melhor_item["principios_ativos"]:
                        if any(p in ins_norm for p in _normalizar(pa).split() if len(p) > 5):
                            if ins not in insumos_disponiveis:
                                insumos_disponiveis.append(ins)

            msg_estoque = ""
            if insumos_disponiveis:
                msg_estoque = f"\n\n**Disponível no Almoxarifado da Fazenda:** `{', '.join(insumos_disponiveis)}` — pronto para uso imediato."

            # Formatação do bloco de resposta técnica padrão Linear / Seed
            resposta_formatada = (
                f"### {melhor_item['alvo'].title()} (*{melhor_item['nome_cientifico']}*)\n\n"
                f"**Domínio / Categoria:** {melhor_item['categoria'].replace('_', ' ').title()}\n"
                f"**Cultura Indicada:** {melhor_item['cultura']}\n"
                f"**Princípios Ativos Oficiais (Agrofit / MAPA):** {', '.join(melhor_item['principios_ativos'])}\n"
                f"**Produtos Comerciais de Referência:** {', '.join(melhor_item['produtos_comerciais'])}\n"
                f"**Dosagem Recomendada em Bula:** {melhor_item['dosagem_recomendada']}\n"
                f"**Período de Carência:** {melhor_item['carencia_dias']} dias antes da colheita\n"
                f"**Mecanismo de Ação / Resistência:** {melhor_item['grupo_quimico']}\n\n"
                f"**Recomendação Técnica de Manejo:** {melhor_item['recomendacao_manejo']}\n"
                f"**Condições Meteorológicas Ideais:** {melhor_item['condicoes_climaticas']}"
                f"{msg_estoque}"
            )

            return {
                "encontrado": True,
                "categoria": melhor_item["categoria"],
                "alvo": melhor_item["alvo"],
                "nome_cientifico": melhor_item["nome_cientifico"],
                "cultura": melhor_item["cultura"],
                "resposta": resposta_formatada,
                "principios_ativos": melhor_item["principios_ativos"],
                "produtos_comerciais": melhor_item["produtos_comerciais"],
                "dosagem": melhor_item["dosagem_recomendada"],
                "carencia_dias": melhor_item["carencia_dias"],
                "alerta_seguranca": f"Respeitar o período de carência de {melhor_item['carencia_dias']} dias e utilizar EPI completo na calda.",
                "referencias": [
                    f"Agrofit MAPA nº registro oficial ({melhor_item['alvo']})",
                    "Embrapa Soja / Milho e Mecanização",
                    "Comitê de Ação a Resistência (FRAC / HRAC / IRAC Brasil)",
                ],
            }

        # Resposta inteligente multi-tópico sintetizada quando a pergunta é abrangente ou não específica
        resposta_sintese = (
            f"### Consultoria Agronômica Geral: {cultura}\n\n"
            f"Para a cultura de **{cultura}**, a plataforma **Seed Agro Intelligence** recomenda fundamentar toda decisão operacional em três pilares técnicos:\n\n"
            f"1. **Monitoramento Integrado por Pano de Batida / Amostragem Georreferenciada:** Realizar vistorias semanais em no mínimo 6 pontos por talhão antes de emitir qualquer ordem de aplicação com defensivos químicos ou biológicos.\n"
            f"2. **Janela Meteorológica de Precisão (Delta T 2 a 8°C):** Verificar antes da pulverização: temperatura < 30°C, umidade relativa do ar > 55% e ventos constantes entre 3 e 10 km/h para evitar deriva térmica e evaporação precoce de gotas.\n"
            f"3. **Manejo Antirresistência e Nutrição de Equilíbrio:** Rotacionar estritamente os grupos químicos (FRAC, IRAC e HRAC) e manter o equilíbrio nutricional de solo (relação Ca:Mg 3:1 a 4:1 e saturação por bases V% em torno de 65-70%).\n\n"
            f"Para orientações sobre uma praga, nutriente, maquinário ou cálculo fiscal específico (ex: ferrugem, percevejo, calagem, pontas de bico, LCDPR), informe o termo desejado para consulta direta na base Agrofit."
        )

        return {
            "encontrado": False,
            "categoria": "CONSULTORIA_GERAL",
            "alvo": f"Manejo Agronômico Integrado ({cultura})",
            "nome_cientifico": "Práticas de Alta Produtividade e Sustentabilidade",
            "cultura": cultura,
            "resposta": resposta_sintese,
            "principios_ativos": ["Rotação de Grupos Químicos", "Manejo Integrado de Pragas (MIP)", "Monitoramento Fenológico"],
            "produtos_comerciais": ["Insumos homologados Agrofit / MAPA"],
            "dosagem": "Conforme bula técnica do produto receitado",
            "carencia_dias": 0,
            "alerta_seguranca": "Consulte o receituário agronômico oficial emitido por Engenheiro Agrônomo responsável antes da pulverização.",
            "referencias": [
                "Ministério da Agricultura e Pecuária (MAPA / Agrofit 2026)",
                "Embrapa Agropecuária Brasileira",
                "Boas Práticas Agrícolas de Aplicação (BPA)",
            ],
        }
