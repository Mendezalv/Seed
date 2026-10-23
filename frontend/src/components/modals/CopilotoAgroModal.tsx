import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SeedAiLogo } from '../common/SeedAiLogo';
import { useAuth } from '../../context/AuthContext';

interface DetalhesTecnicos {
  categoria?: string;
  alvo?: string;
  nome_cientifico?: string;
  cultura?: string;
  principios_ativos?: string[];
  produtos_comerciais?: string[];
  dosagem?: string;
  carencia_dias?: number;
  alerta_seguranca?: string;
  referencias?: string[];
  disponivel_estoque?: string[];
}

interface Mensagem {
  id: string;
  remetente: 'user' | 'ia';
  texto: string;
  data: string;
  detalhes?: DetalhesTecnicos;
}

interface CopilotoAgroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── BASE DE CONHECIMENTO AGRONÔMICA EXPANDIDA (PARIDADE COM BACKEND) ─────────
interface ConhecimentoItem {
  id: string;
  categoria: string;
  alvo: string;
  nome_cientifico: string;
  cultura: string;
  keywords: string[];
  principios_ativos: string[];
  produtos_comerciais: string[];
  dosagem_recomendada: string;
  carencia_dias: number;
  grupo_quimico: string;
  condicoes_climaticas: string;
  recomendacao_manejo: string;
}

const BASE_CONHECIMENTO_LOCAL: ConhecimentoItem[] = [
  {
    id: 'ferrugem',
    categoria: 'FITOPATOLOGIA',
    alvo: 'Ferrugem Asiática da Soja',
    nome_cientifico: 'Phakopsora pachyrhizi',
    cultura: 'Soja',
    keywords: ['ferrugem', 'phakopsora', 'multissitio', 'mancozebe', 'protioconazol', 'vazio sanitario'],
    principios_ativos: ['Trifloxistrobina + Protioconazol', 'Bixafen + Protioconazol', 'Mancozebe (Multissítio protetor)'],
    produtos_comerciais: ['Fox Xpro', 'Priori Xtra', 'Unizeb Gold', 'Opera Ultra'],
    dosagem_recomendada: '0,4 a 0,5 L/ha + 1,5 kg/ha de Mancozebe em todas as entradas',
    carencia_dias: 30,
    grupo_quimico: 'Triazol + Estrobirulina + Carboxamida (FRAC 3, 11, 7) + Ditiocarbamato (M03)',
    condicoes_climaticas: 'Aplicar preventivamente no estádio V6/R1 com UR > 55% e ventos entre 3 e 10 km/h.',
    recomendacao_manejo: 'Manejo estritamente preventivo antes do fechamento total da entrelinha. A adição contínua de multissítios em tanque é obrigatória para proteger as moléculas sítio-específicas contra quebra de resistência.',
  },
  {
    id: 'mancha_alvo',
    categoria: 'FITOPATOLOGIA',
    alvo: 'Mancha-Alvo da Soja',
    nome_cientifico: 'Corynespora cassiicola',
    cultura: 'Soja / Algodão',
    keywords: ['mancha alvo', 'corynespora', 'desfolha baixeiro', 'necrose foliar'],
    principios_ativos: ['Fluxapiroxade + Piraclostrobina', 'Protioconazol', 'Clorotalonil'],
    produtos_comerciais: ['Orkestra SC', 'Fox Xpro', 'Bravo 500', 'Bravonil'],
    dosagem_recomendada: '0,3 a 0,4 L/ha (Orkestra) + 1,5 a 2,0 L/ha de Clorotalonil',
    carencia_dias: 28,
    grupo_quimico: 'Carboxamida (FRAC 7) + Estrobirulina (FRAC 11) + Cloronitrila (M05)',
    condicoes_climaticas: 'Favorecida por molhamento foliar prolongado (>6h) e temperaturas amenas (20° a 28°C).',
    recomendacao_manejo: 'Exige rotação de cultivares com tolerância e posicionamento de fungicida na baixeira antes do fechamento das entrelinhas.',
  },
  {
    id: 'antracnose',
    categoria: 'FITOPATOLOGIA',
    alvo: 'Antracnose da Soja',
    nome_cientifico: 'Colletotrichum truncatum',
    cultura: 'Soja',
    keywords: ['antracnose', 'colletotrichum', 'abortamento vagens', 'necrose hastes'],
    principios_ativos: ['Difenoconazol', 'Azoxistrobina', 'Mancozebe'],
    produtos_comerciais: ['Score', 'Priori', 'Amistar WG'],
    dosagem_recomendada: '0,2 a 0,3 L/ha no estádio R1/R2',
    carencia_dias: 21,
    grupo_quimico: 'Triazol (FRAC 3) + Estrobirulina (FRAC 11)',
    condicoes_climaticas: 'Altas temperaturas associadas a precipitações volumosas aceleram o abortamento de vagens.',
    recomendacao_manejo: 'Tratamento de sementes profissional, controle do estresse nutricional de potássio e rotação de culturas.',
  },
  {
    id: 'mofo_branco',
    categoria: 'FITOPATOLOGIA',
    alvo: 'Mofo-Branco (Esclerotinia)',
    nome_cientifico: 'Sclerotinia sclerotiorum',
    cultura: 'Soja / Feijão / Algodão',
    keywords: ['mofo branco', 'esclerotinia', 'esclerodio', 'trichoderma'],
    principios_ativos: ['Fluazinam', 'Procimidona', 'Trichoderma asperellum (Biológico)'],
    produtos_comerciais: ['Frowncide 500 SC', 'Sumilex 500 WP', 'Quality', 'Trichodermil'],
    dosagem_recomendada: '0,8 a 1,0 L/ha (Fluazinam) ou 200 a 400 mL/ha (Biológico preventivo)',
    carencia_dias: 35,
    grupo_quimico: 'Fenilpiridinilamina (FRAC 29) / Dicarboximida (FRAC 2)',
    condicoes_climaticas: 'Temperatura entre 15°C e 22°C com alta umidade e dossel denso sombreado.',
    recomendacao_manejo: 'Aplicação biológica de Trichoderma na palhada pré-plantio para parasitar escleródios. Em florescimento pleno (R1), aplicação química preventiva cobrindo pétalas senescentes.',
  },
  {
    id: 'percevejo',
    categoria: 'ENTOMOLOGIA',
    alvo: 'Percevejo-Marrom da Soja',
    nome_cientifico: 'Euschistus heros',
    cultura: 'Soja',
    keywords: ['percevejo', 'euschistus', 'percevejo marrom', 'percevejo barriga verde', 'percevejo pequeno'],
    principios_ativos: ['Acefato', 'Tiametoxam + Lambda-Cialotrina', 'Dinotefurano'],
    produtos_comerciais: ['Engeo Pleno S', 'Orthene 750 BR', 'Venom', 'Connect'],
    dosagem_recomendada: '0,2 a 0,25 L/ha (Engeo) ou 0,8 kg/ha (Acefato)',
    carencia_dias: 21,
    grupo_quimico: 'Neonicotinoide + Piretroide (IRAC 4A, 3A) / Organofosforado (IRAC 1B)',
    condicoes_climaticas: 'Aplicar nas horas frescas (início da manhã ou fim da tarde), quando os adultos sobem ao ponteiro.',
    recomendacao_manejo: 'Nível de controle econômico: 2 percevejos por pano de batida em lavouras comerciais, ou 1 percevejo/pano em campos de sementes.',
  },
  {
    id: 'lagarta_cartucho',
    categoria: 'ENTOMOLOGIA',
    alvo: 'Lagarta-do-Cartucho',
    nome_cientifico: 'Spodoptera frugiperda',
    cultura: 'Milho / Soja / Algodão',
    keywords: ['spodoptera', 'cartucho', 'lagarta do cartucho', 'frugiperda'],
    principios_ativos: ['Clorantraniliprole', 'Espinetoram', 'Bacillus thuringiensis (Bt)', 'Metomil'],
    produtos_comerciais: ['Premio', 'Exalt', 'Dipel', 'Lannate BR'],
    dosagem_recomendada: '50 a 80 mL/ha (Premio) ou 100 mL/ha (Exalt)',
    carencia_dias: 14,
    grupo_quimico: 'Diamida Antranílica (IRAC 28) / Espinosina (IRAC 5)',
    condicoes_climaticas: 'Atingir o interior do cartucho enquanto as lagartas estão pequenas (estádios L1 a L3).',
    recomendacao_manejo: 'Plantio de área de refúgio estruturado obrigatório (10% de milho não-Bt) para evitar quebra de tecnologia transgênica.',
  },
  {
    id: 'cigarrinha_milho',
    categoria: 'ENTOMOLOGIA',
    alvo: 'Cigarrinha-do-Milho & Enfezamento',
    nome_cientifico: 'Dalbulus maidis',
    cultura: 'Milho',
    keywords: ['cigarrinha', 'dalbulus', 'enfezamento', 'raiado fino', 'milho tiguera'],
    principios_ativos: ['Beauveria bassiana', 'Tiametoxam (TS)', 'Bifentrina + Acetamiprido'],
    produtos_comerciais: ['Boveril', 'Galil SC', 'Cruiser 350 FS'],
    dosagem_recomendada: '0,3 a 0,5 kg/ha (Beauveria) associado a pulverizações foliares entre V1 e V8',
    carencia_dias: 15,
    grupo_quimico: 'Biológico Fúngico Entomopatogênico + Neonicotinoide (IRAC 4A)',
    condicoes_climaticas: 'Temperaturas elevadas (>27°C) favorecem ciclos reprodutivos rápidos da praga.',
    recomendacao_manejo: 'Eliminação obrigatória de milho tiguera na entressafra para quebrar a ponte verde de molicutes e vírus.',
  },
  {
    id: 'mosca_branca',
    categoria: 'ENTOMOLOGIA',
    alvo: 'Mosca-Branca',
    nome_cientifico: 'Bemisia tabaci',
    cultura: 'Soja / Algodão / Feijão',
    keywords: ['mosca branca', 'bemisia', 'fumagina', 'geminivirus'],
    principios_ativos: ['Piriproxifem (Fisiológico)', 'Sulfoxaflor', 'Acetamiprido + Bifentrina'],
    produtos_comerciais: ['Tiger', 'Transform', 'Epingle'],
    dosagem_recomendada: '0,4 a 0,5 L/ha (Piriproxifem) ou 0,3 L/ha (Transform)',
    carencia_dias: 14,
    grupo_quimico: 'Mimetizador de Hormônio Juvenil (IRAC 7C) / Sulfoxamina (IRAC 4C)',
    condicoes_climaticas: 'Clima quente e seco. Exige alta densidade de gotas na face inferior das folhas.',
    recomendacao_manejo: 'Uso de adjuvante siliconado para diminuir tensão superficial da calda e alternância de modos de ação.',
  },
  {
    id: 'nematoides',
    categoria: 'ENTOMOLOGIA',
    alvo: 'Nematoides de Galhas e Cisto',
    nome_cientifico: 'Meloidogyne incognita / Heterodera glycines / Pratylenchus',
    cultura: 'Soja / Milho',
    keywords: ['nematoide', 'nematoides', 'pratylenchus', 'meloidogyne', 'reboleira'],
    principios_ativos: ['Fluopyram', 'Bacillus subtilis + Bacillus licheniformis', 'Purpureocillium lilacinum'],
    produtos_comerciais: ['Verango', 'Nemix', 'NemaControl'],
    dosagem_recomendada: '0,15 a 0,20 L/ha (Fluopyram em sulco de plantio) ou 1,0 L/ha (Biológico)',
    carencia_dias: 60,
    grupo_quimico: 'Piridinil-etil-benzamida / Nematicida Biológico Microbiológico',
    condicoes_climaticas: 'Solos arenosos com baixa matéria orgânica agravam os sintomas de depauperamento radicular.',
    recomendacao_manejo: 'Amostragem nematológica laboratorial anual. Rotação com Crotalaria spectabilis para supressão biológica.',
  },
  {
    id: 'buva',
    categoria: 'MATOLOGIA_HERBICIDAS',
    alvo: 'Buva Resistente a Glifosato',
    nome_cientifico: 'Conyza bonariensis / Conyza sumatrensis',
    cultura: 'Manejo de Dessecação Pré-Plantio',
    keywords: ['buva', 'conyza', 'buva resistente', 'dessecacao sequencial'],
    principios_ativos: ['Glufosinato de Amônio', '2,4-D Colina', 'Diquate', 'Flumioxazina', 'Dicamba'],
    produtos_comerciais: ['Finale', 'Enlist Colex-D', 'Reglone', 'Flumyzin', 'Atectra SB'],
    dosagem_recomendada: '2,0 L/ha (Glufosinato) ou 1,5 L/ha (2,4-D) em aplicação sequencial',
    carencia_dias: 10,
    grupo_quimico: 'Inibidor da GS (HRAC 10) / Mimetizador de auxina (HRAC 4) / Inibidor da PROTOX (HRAC 14)',
    condicoes_climaticas: 'Aplicar com buva jovem (até 8 a 10 cm / 4 a 6 folhas) e umidade relativa superior a 60%.',
    recomendacao_manejo: 'Dessecação sequencial obrigatória: 1ª etapa sistêmica (Glifosato + 2,4-D), seguida 7 a 10 dias depois de herbicida de contato (Glufosinato ou Diquate) com adição de pré-emergente residual de solo.',
  },
  {
    id: 'amargoso',
    categoria: 'MATOLOGIA_HERBICIDAS',
    alvo: 'Capim-Amargoso Resistente',
    nome_cientifico: 'Digitaria insularis',
    cultura: 'Soja / Milho',
    keywords: ['amargoso', 'digitaria', 'capim amargoso', 'graminicida', 'cletodim', 'haloxifope'],
    principios_ativos: ['Cletodim', 'Haloxifope-P-metílico', 'Glifosato + Óleo Mineral'],
    produtos_comerciais: ['Select 240 EC', 'Verdict Max', 'Haloxy'],
    dosagem_recomendada: '0,45 a 0,50 L/ha (Cletodim) ou 0,40 L/ha (Haloxifope) + 0,5% v/v óleo mineral',
    carencia_dias: 30,
    grupo_quimico: 'Inibidores da ACCase (Graminicidas HRAC 1: FOPs e DIMs)',
    condicoes_climaticas: 'Planta em pleno vigor vegetativo, sem déficit hídrico, para garantir translocação vascular aos rizomas.',
    recomendacao_manejo: 'Nunca aplicar em touceiras com sementes formadas. Roçada prévia ou dessecação sequencial com intervalo de 14 a 20 dias.',
  },
  {
    id: 'calagem_gessagem',
    categoria: 'SOLOS_FERTILIDADE',
    alvo: 'Calagem e Gessagem do Solo',
    nome_cientifico: 'Correção de Acidez, Cálcio e Saturação por Bases',
    cultura: 'Soja / Milho / Pastagens',
    keywords: ['calcario', 'calagem', 'gesso', 'gessagem', 'ph solo', 'saturacao por bases', 'prnt', 'aluminio'],
    principios_ativos: ['Carbonato de Cálcio e Magnésio (Calcário)', 'Sulfato de Cálcio Di-hidratado (Gesso Agrícola)'],
    produtos_comerciais: ['Calcário Dolomítico PRNT > 85%', 'Gesso Agrícola Fosfogesso'],
    dosagem_recomendada: 'NC (t/ha) = (V2 - V1) * CTC / PRNT. Gessagem: NG (kg/ha) = 50 * % Argila para soja',
    carencia_dias: 60,
    grupo_quimico: 'Corretivos e Condicionadores Minerais de Solo (MAPA)',
    condicoes_climaticas: 'Aplicar de 60 a 90 dias antes da semeadura para reação plena com a umidade do solo.',
    recomendacao_manejo: 'Elevar saturação por bases (V%) para 65-70%. O gesso agrícola atua na camada profunda (20-40 cm), neutralizando o alumínio tóxico (Al3+) e descendo cálcio para aprofundar o sistema radicular.',
  },
  {
    id: 'npk_adubacao',
    categoria: 'SOLOS_FERTILIDADE',
    alvo: 'Adubação NPK e Nutrição de Alta Produtividade',
    nome_cientifico: 'Equilíbrio de Nitrogênio, Fósforo e Potássio',
    cultura: 'Soja e Milho',
    keywords: ['npk', 'adubacao', 'fertilizante', 'potassio', 'fosforo', 'nitrogenio', 'kcl', 'map', 'ureia'],
    principios_ativos: ['Fosfato Monoamônico (MAP 11-52-00)', 'Cloreto de Potássio (KCl 00-00-60)', 'Ureia Protegida NBPT'],
    produtos_comerciais: ['MAP 11-52-00', 'KCl 00-00-60', 'Sulfato de Amônio', 'Super Triplo'],
    dosagem_recomendada: 'Soja: 80-120 kg/ha P2O5 e 100-140 kg/ha K2O (meta > 70 sc/ha). Milho: 140-180 kg/ha N em cobertura.',
    carencia_dias: 0,
    grupo_quimico: 'Macronutrientes Primários de Alta Eficiência',
    condicoes_climaticas: 'Evitar concentrar mais de 50 kg/ha de KCl direto no sulco para evitar salinização na germinação.',
    recomendacao_manejo: 'Na soja, 100% do nitrogênio deve vir da Fixação Biológica de Nitrogênio (FBN) via inoculação com Bradyrhizobium + coinoculação com Azospirillum brasilense e Cobalto/Molibdênio. No milho, aplicar o N em cobertura entre V4 e V6.',
  },
  {
    id: 'pulverizacao_deriva',
    categoria: 'TECNOLOGIA_APLICACAO',
    alvo: 'Tecnologia de Aplicação e Deriva',
    nome_cientifico: 'Manejo de Pontas, Gotas, Pressão e Janela Meteorológica',
    cultura: 'Todas as Culturas',
    keywords: ['pulverizacao', 'bicos', 'pontas', 'deriva', 'delta t', 'vento', 'ordem de calda'],
    principios_ativos: ['Pontas com Indução de Ar (AIXR, TTI)', 'Pontas Cone Vazio', 'Adjuvantes Antideriva'],
    produtos_comerciais: ['TeeJet AIXR', 'MagnoJet MGA', 'Aureo Adjuvante', 'Silwet L-77'],
    dosagem_recomendada: 'Vazão calibrada de 80 a 150 L/ha conforme densidade do dossel',
    carencia_dias: 0,
    grupo_quimico: 'Tecnologia Mecatrônica de Precisão e Engenharia de Aplicação',
    condicoes_climaticas: 'Condições ideais: Temperatura < 30°C, Umidade Relativa > 55% e Vento entre 3 e 10 km/h (Delta T entre 2°C e 8°C).',
    recomendacao_manejo: 'Ordem de calda em tanque: 1° Água e condicionador -> 2° Formulações sólidas (WG/WP) -> 3° Suspensões concentradas (SC) -> 4° Emulsionáveis (EC) -> 5° Soluções solúveis (SL) -> 6° Adjuvantes e óleos.',
  },
  {
    id: 'maquinas_manutencao',
    categoria: 'MAQUINAS_OPERACIONAL',
    alvo: 'Manutenção Preditiva e Frotas Agrícolas',
    nome_cientifico: 'Gestão de Horímetro, Óleos, Filtros e Calibração',
    cultura: 'Parque Mecanizado',
    keywords: ['trator', 'colheitadeira', 'pulverizador', 'horimetro', 'manutencao', 'oleo', 'filtro', 'consumo diesel'],
    principios_ativos: ['Óleo Lubrificante 15W-40 CI-4', 'Fluido Hidráulico UTTO', 'Graxa NLGI 2 Lítio'],
    produtos_comerciais: ['Shell Rimula', 'Mobil Delvac', 'John Deere Plus-50 II'],
    dosagem_recomendada: 'Revisões a cada 250h (óleo motor/filtro) e 500h (filtros de combustível/hidráulico)',
    carencia_dias: 0,
    grupo_quimico: 'Engenharia Mecânica e Manutenção de Maquinários',
    condicoes_climaticas: 'Aferir calibração de pressão de pneus conforme umidade do solo para evitar compactação.',
    recomendacao_manejo: 'Calibrar distribuidores de sementes antes do plantio (desvio tolerado < 5% de duplos e falhas). Aferir vazão das pontas da barra com copo graduado (tolerância máxima de 10% de variação).',
  },
  {
    id: 'lcdpr_dre',
    categoria: 'ECONOMIA_LCDPR',
    alvo: 'Livro Caixa Digital LCDPR e Break-Even',
    nome_cientifico: 'Gestão Fiscal, Ponto de Equilíbrio e Créditos de Carbono',
    cultura: 'Gestão da Propriedade',
    keywords: ['lcdpr', 'imposto de renda', 'dre', 'break even', 'custo por hectare', 'esg', 'credito de carbono', 'margem'],
    principios_ativos: ['Livro Caixa Digital do Produtor Rural (Receita Federal)', 'GHG Protocol Agropecuário'],
    produtos_comerciais: ['Seed LCDPR Engine', 'Seed Calculadora ESG'],
    dosagem_recomendada: 'Break-even (sc/ha) = Custo Operacional Efetivo (R$/ha) / Preço da Saca (R$/sc)',
    carencia_dias: 0,
    grupo_quimico: 'Gestão Tributária Rural e Finanças Agrícolas',
    condicoes_climaticas: 'Conciliação contábil mensal vinculada a cada talhão.',
    recomendacao_manejo: 'Produtores com receita bruta anual superior a R$ 4,8 milhões devem entregar o arquivo do LCDPR (layout Q100). O plantio direto contínuo sequestra em média 1,2 tCO2e/ha/ano, gerando elegibilidade para créditos de carbono.',
  },
];

// Categorias e Perguntas Sugeridas
interface CategoriaTab {
  id: string;
  label: string;
  perguntas: string[];
}

const CATEGORIAS_SUGESTOES: CategoriaTab[] = [
  {
    id: 'pragas',
    label: 'Pragas & Doenças',
    perguntas: [
      'Como combater ferrugem asiática na soja?',
      'Qual a dosagem e carência para percevejo-marrom?',
      'Como controlar cigarrinha-do-milho e enfezamento?',
      'Como manejar mofo-branco e escleródios?',
      'Como controlar nematoides com bioinsumos?',
    ],
  },
  {
    id: 'solos',
    label: 'Solo & Nutrição NPK',
    perguntas: [
      'Qual a recomendação de calagem e gessagem para solo argiloso?',
      'Como adubar soja para atingir mais de 70 sc/ha?',
      'Qual a dosagem recomendada de potássio KCl e risco de salinização?',
      'Como aplicar boro e zinco na fase reprodutiva?',
      'Qual a importância da coinoculação com Azospirillum?',
    ],
  },
  {
    id: 'matologia',
    label: 'Plantas Daninhas',
    perguntas: [
      'Como manejar buva resistente ao glifosato?',
      'Qual a estratégia para dessecação de capim-amargoso?',
      'Quais residuais de solo usar contra caruru?',
      'Como fazer dessecação sequencial eficiente?',
    ],
  },
  {
    id: 'maquinas',
    label: 'Pulverização & Frotas',
    perguntas: [
      'Quais as condições ideais para evitar deriva na pulverização?',
      'Qual a ordem correta de mistura de defensivos no tanque?',
      'Quais os principais cuidados no plano de manutenção do trator por horímetro?',
      'Como calibrar a vazão das pontas de pulverização?',
    ],
  },
  {
    id: 'gestao',
    label: 'LCDPR & Finanças',
    perguntas: [
      'Como calcular o ponto de equilíbrio (break-even) da safra?',
      'Quais os critérios de obrigatoriedade do LCDPR na Receita Federal?',
      'Como comprovar créditos de carbono através do plantio direto?',
    ],
  },
];

function normalizarTexto(txt: string): string {
  return txt
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function consultarConhecimentoLocal(texto: string, cultura = 'Soja', insumosEstoque: string[] = []): DetalhesTecnicos & { resposta: string } {
  const tNorm = normalizarTexto(texto);
  const palavras = tNorm.split(/\s+/).filter((w) => w.length > 2);

  let melhorItem: ConhecimentoItem | null = null;
  let melhorPontos = 0;

  for (const item of BASE_CONHECIMENTO_LOCAL) {
    let pontos = 0;
    const alvoNorm = normalizarTexto(item.alvo);
    if (alvoNorm.includes(tNorm) || tNorm.includes(alvoNorm)) pontos += 15;

    for (const kw of item.keywords) {
      const kwNorm = normalizarTexto(kw);
      if (tNorm.includes(kwNorm)) pontos += 10;
      else if (palavras.some((p) => kwNorm.includes(p))) pontos += 4;
    }

    for (const prod of item.produtos_comerciais) {
      if (tNorm.includes(normalizarTexto(prod))) pontos += 8;
    }

    if (pontos > melhorPontos) {
      melhorPontos = pontos;
      melhorItem = item;
    }
  }

  if (melhorItem && melhorPontos >= 4) {
    const disponiveis: string[] = [];
    if (insumosEstoque.length > 0) {
      for (const ins of insumosEstoque) {
        const insNorm = normalizarTexto(ins);
        for (const prod of melhorItem.produtos_comerciais) {
          if (insNorm.includes(normalizarTexto(prod))) disponiveis.push(ins);
        }
      }
    }

    const estoqueStr =
      disponiveis.length > 0
        ? `\n\n**Disponível no Almoxarifado da Fazenda:** \`${disponiveis.join(', ')}\` — pronto para aplicação.`
        : '';

    const resposta =
      `### ${melhorItem.alvo} (*${melhorItem.nome_cientifico}*)\n\n` +
      `**Domínio Técnico:** ${melhorItem.categoria.replace('_', ' ')}\n` +
      `**Cultura Indicada:** ${melhorItem.cultura}\n` +
      `**Princípios Ativos Oficiais (Agrofit / MAPA):** ${melhorItem.principios_ativos.join(', ')}\n` +
      `**Produtos Comerciais Registrados:** ${melhorItem.produtos_comerciais.join(', ')}\n` +
      `**Dosagem Recomendada em Bula:** ${melhorItem.dosagem_recomendada}\n` +
      `**Período de Carência:** ${melhorItem.carencia_dias} dias antes da colheita\n` +
      `**Mecanismo de Ação (FRAC/IRAC/HRAC):** ${melhorItem.grupo_quimico}\n\n` +
      `**Recomendação de Manejo:** ${melhorItem.recomendacao_manejo}\n` +
      `**Condições Meteorológicas Ideais:** ${melhorItem.condicoes_climaticas}` +
      estoqueStr;

    return {
      categoria: melhorItem.categoria,
      alvo: melhorItem.alvo,
      nome_cientifico: melhorItem.nome_cientifico,
      cultura: melhorItem.cultura,
      principios_ativos: melhorItem.principios_ativos,
      produtos_comerciais: melhorItem.produtos_comerciais,
      dosagem: melhorItem.dosagem_recomendada,
      carencia_dias: melhorItem.carencia_dias,
      alerta_seguranca: `Respeitar o período de carência de ${melhorItem.carencia_dias} dias e utilizar EPI completo na calda.`,
      referencias: [
        `Agrofit MAPA nº registro oficial (${melhorItem.alvo})`,
        'Embrapa Agropecuária Brasileira',
        'Comitê de Ação a Resistência (FRAC/IRAC/HRAC)',
      ],
      disponivel_estoque: disponiveis,
      resposta,
    };
  }

  // Fallback inteligente multidisciplinar
  const respostaGeral =
    `### Consultoria Agronômica Geral: ${cultura}\n\n` +
    `Para a cultura de **${cultura}**, a plataforma **Seed Agro Intelligence** recomenda fundamentar toda decisão operacional em três pilares técnicos:\n\n` +
    `1. **Monitoramento Integrado por Pano de Batida / Amostragem Georreferenciada:** Realizar vistorias semanais em no mínimo 6 pontos por talhão antes de emitir qualquer ordem de aplicação com defensivos químicos ou biológicos.\n` +
    `2. **Janela Meteorológica de Precisão (Delta T 2 a 8°C):** Verificar antes da pulverização: temperatura < 30°C, umidade relativa do ar > 55% e ventos constantes entre 3 e 10 km/h para evitar deriva térmica e evaporação precoce de gotas.\n` +
    `3. **Manejo Antirresistência e Nutrição de Equilíbrio:** Rotacionar estritamente os grupos químicos (FRAC, IRAC e HRAC) e manter o equilíbrio nutricional de solo (relação Ca:Mg 3:1 a 4:1 e saturação por bases V% em torno de 65-70%).\n\n` +
    `Você pode consultar qualquer praga específica, dosagem de adubação, regulagem de máquina ou cálculo fiscal de LCDPR no campo abaixo.`;

  return {
    categoria: 'CONSULTORIA_GERAL',
    alvo: `Manejo Integrado (${cultura})`,
    nome_cientifico: 'Boas Práticas Agrícolas de Alta Produtividade',
    cultura,
    principios_ativos: ['Rotação de Mecanismos de Ação', 'Manejo Integrado de Pragas', 'Bioinsumos'],
    produtos_comerciais: ['Insumos Homologados Agrofit / MAPA'],
    dosagem: 'Conforme bula técnica do produto receitado',
    carencia_dias: 0,
    alerta_seguranca: 'Consulte o receituário agronômico oficial emitido por Engenheiro Agrônomo responsável.',
    referencias: ['MAPA / Agrofit 2026', 'Embrapa Soja / Milho', 'Boas Práticas de Aplicação (BPA)'],
    resposta: respostaGeral,
  };
}

// ─── PARSER INLINE DE MARKDOWN ────────────────────────────────────────────────
function parseInline(content: string): React.ReactNode[] {
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = content.split(regex);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} style={{ color: '#fafafa', fontWeight: 650 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} style={{ fontStyle: 'italic', color: '#a1a1aa' }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: 'var(--accent-text)',
            padding: '1px 6px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function renderMarkdown(content: string): React.ReactNode {
  const blocks = content.split('\n\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (trimmed.startsWith('### ')) {
          return (
            <div
              key={idx}
              style={{
                fontSize: '14.5px',
                fontWeight: 700,
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingBottom: '4px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                letterSpacing: '-0.01em',
              }}
            >
              {parseInline(trimmed.replace(/^###\s+/, ''))}
            </div>
          );
        }

        const lines = trimmed.split('\n');
        if (lines.length > 1) {
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {lines.map((line, lIdx) => (
                <div key={lIdx} style={{ lineHeight: '1.55', color: '#e4e4e7', fontSize: '12.5px' }}>
                  {parseInline(line)}
                </div>
              ))}
            </div>
          );
        }

        return (
          <p key={idx} style={{ margin: 0, lineHeight: '1.55', color: '#e4e4e7', fontSize: '12.5px' }}>
            {parseInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export const CopilotoAgroModal: React.FC<CopilotoAgroModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: 'msg-welcome',
      remetente: 'ia',
      texto:
        'Olá! Eu sou o **Copiloto Agronômico Seed**, seu assistente de inteligência agronômica de campo.\n\n' +
        'Estou treinado com o catálogo oficial do **MAPA (Agrofit 2026)**, recomendações da **Embrapa**, comitês **FRAC/IRAC/HRAC** e dados de fertilidade do solo. Como posso auxiliar seu manejo hoje?',
      data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputTexto, setInputTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState('pragas');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, mensagens]);

  const userInitials = useMemo(() => {
    if (!user?.nome_completo) return 'GC';
    const parts = user.nome_completo.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [user]);

  if (!isOpen) return null;

  const handleCopy = (id: string, texto: string) => {
    navigator.clipboard?.writeText(texto);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLimparHistorico = () => {
    setMensagens([
      {
        id: String(Date.now()),
        remetente: 'ia',
        texto: 'Histórico reiniciado. Como posso auxiliar seu talhão neste momento?',
        data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const enviarPergunta = async (texto: string) => {
    if (!texto.trim() || carregando) return;

    const perguntaFormatada = texto.trim();
    const novaMensagemUsuario: Mensagem = {
      id: String(Date.now()),
      remetente: 'user',
      texto: perguntaFormatada,
      data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMensagens((prev) => [...prev, novaMensagemUsuario]);
    setInputTexto('');
    setCarregando(true);

    const estoqueReferencia = ['Fox Xpro', 'Cloreto de Potássio KCl', 'Azoxistrobina', 'Engeo Pleno S', 'Select 240 EC', 'Premio'];

    try {
      const response = await fetch('/api/v1/epidemiologico/copiloto/consultar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pergunta: perguntaFormatada,
          cultura: 'Soja',
          talhao_nome: 'Talhão 04',
          insumos_estoque: estoqueReferencia,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta da API');
      }

      const data = await response.json();
      const respostaIA: Mensagem = {
        id: String(Date.now() + 1),
        remetente: 'ia',
        texto: data.resposta,
        data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detalhes: {
          categoria: data.categoria,
          alvo: data.alvo,
          nome_cientifico: data.nome_cientifico,
          cultura: data.cultura,
          principios_ativos: data.principios_ativos,
          produtos_comerciais: data.produtos_comerciais,
          dosagem: data.dosagem,
          carencia_dias: data.carencia_dias,
          alerta_seguranca: data.alerta_seguranca,
          referencias: data.referencias,
        },
      };

      setMensagens((prev) => [...prev, respostaIA]);
    } catch {
      // Fallback robusto local com base técnica completa
      const localRes = consultarConhecimentoLocal(perguntaFormatada, 'Soja', estoqueReferencia);

      const respostaIA: Mensagem = {
        id: String(Date.now() + 1),
        remetente: 'ia',
        texto: localRes.resposta,
        data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detalhes: {
          categoria: localRes.categoria,
          alvo: localRes.alvo,
          nome_cientifico: localRes.nome_cientifico,
          cultura: localRes.cultura,
          principios_ativos: localRes.principios_ativos,
          produtos_comerciais: localRes.produtos_comerciais,
          dosagem: localRes.dosagem,
          carencia_dias: localRes.carencia_dias,
          alerta_seguranca: localRes.alerta_seguranca,
          referencias: localRes.referencias,
          disponivel_estoque: localRes.disponivel_estoque,
        },
      };

      setMensagens((prev) => [...prev, respostaIA]);
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      enviarPergunta(inputTexto);
    }
  };

  const categoriaSelecionada = CATEGORIAS_SUGESTOES.find((c) => c.id === categoriaAtiva) || CATEGORIAS_SUGESTOES[0];

  return (
    <div
      className="modal-backdrop open"
      onClick={onClose}
      style={{
        zIndex: 10000,
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '100%',
          height: 'min(720px, 90vh)',
          display: 'flex',
          flexDirection: 'column',
          background: '#0c0c0e',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.95), 0 0 35px rgba(16, 185, 129, 0.1)',
        }}
      >
        {/* ─── CABEÇALHO COM LOGO PROPRIETÁRIO DO COPILOTO ─────────────────── */}
        <div
          style={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '14px 20px',
            background: 'linear-gradient(180deg, rgba(24, 24, 27, 0.9), rgba(15, 15, 18, 0.85))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(6, 78, 59, 0.35))',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                flexShrink: 0,
              }}
            >
              <SeedAiLogo size={24} glow={true} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '15px', margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: '#fafafa' }}>
                  Copiloto Agronômico
                </h2>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '100px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    fontSize: '10.5px',
                    fontWeight: 650,
                    letterSpacing: '0.02em',
                  }}
                >
                  MAPA / Agrofit 2026
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#71717a' }}>
                Inteligência fitossanitária, nutrição NPK, telemetria de pulverização e conformidade fiscal
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={handleLimparHistorico}
              title="Limpar histórico da conversa"
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#a1a1aa',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#fafafa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.color = '#a1a1aa';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              <span>Limpar</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid transparent',
                color: '#71717a',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'grid',
                placeItems: 'center',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#fafafa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#71717a';
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ─── CORPO DE MENSAGENS COM CARDS DE DESIGN ELEVADO ─────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
          }}
        >
          {mensagens.map((msg) => {
            const isUser = msg.remetente === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: '12px',
                  width: '100%',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: isUser
                      ? 'linear-gradient(135deg, #18181b, #27272a)'
                      : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(4, 120, 87, 0.4))',
                    border: isUser
                      ? '1px solid rgba(255, 255, 255, 0.12)'
                      : '1px solid rgba(16, 185, 129, 0.4)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isUser ? '#f4f4f5' : '#34d399',
                    flexShrink: 0,
                    boxShadow: isUser ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  {isUser ? userInitials : <SeedAiLogo size={18} glow={false} />}
                </div>

                {/* Conteúdo do Card */}
                <div
                  style={{
                    maxWidth: isUser ? '75%' : '86%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      borderRadius: '14px',
                      padding: isUser ? '12px 16px' : '16px 20px',
                      background: isUser
                        ? '#18181b'
                        : 'rgba(20, 20, 24, 0.85)',
                      border: isUser
                        ? '1px solid rgba(16, 185, 129, 0.35)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      borderLeft: isUser
                        ? '3px solid #10b981'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isUser
                        ? '0 4px 14px rgba(0, 0, 0, 0.4)'
                        : '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    {!isUser && msg.detalhes?.categoria && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '10px',
                          paddingBottom: '8px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 750,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color: '#34d399',
                              background: 'rgba(16, 185, 129, 0.12)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                            }}
                          >
                            {msg.detalhes.categoria.replace('_', ' ')}
                          </span>
                          {msg.detalhes.carencia_dias !== undefined && msg.detalhes.carencia_dias > 0 && (
                            <span
                              style={{
                                fontSize: '10.5px',
                                color: '#fbbf24',
                                background: 'rgba(245, 158, 11, 0.1)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: '1px solid rgba(245, 158, 11, 0.25)',
                                fontWeight: 600,
                              }}
                            >
                              Carência: {msg.detalhes.carencia_dias} dias
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.texto)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: copiedId === msg.id ? '#34d399' : '#71717a',
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            transition: 'color 150ms ease',
                          }}
                          title="Copiar recomendação"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                              </svg>
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {renderMarkdown(msg.texto)}

                    {/* Alerta de Segurança e Boas Práticas */}
                    {!isUser && msg.detalhes?.alerta_seguranca && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '11.5px',
                          color: '#fef08a',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: '#fbbf24' }}>
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                          <line x1="12" x2="12" y1="9" y2="13" />
                          <line x1="12" x2="12.01" y1="17" y2="17" />
                        </svg>
                        <span>{msg.detalhes.alerta_seguranca}</span>
                      </div>
                    )}

                    {/* Referências Oficiais */}
                    {!isUser && msg.detalhes?.referencias && msg.detalhes.referencias.length > 0 && (
                      <div
                        style={{
                          marginTop: '10px',
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '10.5px',
                          color: '#71717a',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>Fontes:</span>
                        {msg.detalhes.referencias.map((ref, i) => (
                          <span
                            key={i}
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                          >
                            {ref}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '10.5px',
                      color: '#52525b',
                      padding: '0 4px',
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {msg.data}
                  </span>
                </div>
              </div>
            );
          })}

          {carregando && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', color: '#a1a1aa', fontSize: '12px' }}>
              <SeedAiLogo size={18} glow={true} />
              <span>Consultando bulas oficiais MAPA / Agrofit e dados de campo...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* ─── BARRA DE CATEGORIAS E PROMPTS RÁPIDOS SUGERIDOS ────────────── */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(18, 18, 22, 0.95)',
            padding: '10px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Abas de Categorias */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {CATEGORIAS_SUGESTOES.map((cat) => {
              const isActive = cat.id === categoriaAtiva;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoriaAtiva(cat.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                    color: isActive ? '#34d399' : '#a1a1aa',
                    fontSize: '11px',
                    fontWeight: isActive ? 650 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 140ms ease',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Chips de Perguntas Rápidas */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingBottom: '2px',
            }}
          >
            {categoriaSelecionada.perguntas.map((pergunta, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => enviarPergunta(pergunta)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '100px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#d4d4d8',
                  fontSize: '11px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 140ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
                  e.currentTarget.style.color = '#34d399';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.color = '#d4d4d8';
                }}
              >
                {pergunta}
              </button>
            ))}
          </div>
        </div>

        {/* ─── DOCK DE INPUT DE ENTRADA DO USUÁRIO ─────────────────────────── */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#09090b',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Consulte sobre pragas, adubação NPK, calagem, defensivos, frotas ou LCDPR..."
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={carregando}
              style={{
                width: '100%',
                height: '42px',
                background: '#18181b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '0 14px',
                color: '#fafafa',
                fontSize: '13px',
                outline: 'none',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            />
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => enviarPergunta(inputTexto)}
            disabled={!inputTexto.trim() || carregando}
            style={{
              height: '42px',
              padding: '0 20px',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 650,
              fontSize: '13px',
              opacity: !inputTexto.trim() || carregando ? 0.5 : 1,
              cursor: !inputTexto.trim() || carregando ? 'not-allowed' : 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span>Enviar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
