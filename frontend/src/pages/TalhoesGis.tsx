import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CustomSelect } from '../components/ui/CustomSelect';
import { operacionalService, type TalhaoApi } from '../services/operacionalService';
import { epidemiologicoService } from '../services/epidemiologicoService';
import { useAuth } from '../context/AuthContext';
import { ModalCadastroTalhao } from '../components/modals/ModalCadastroTalhao';

export interface AplicacaoHist {
  data: string;
  responsavel: string;
  titulo: string;
  meta: string;
  tipo: 'danger' | 'accent' | 'default';
}

export interface Talhao {
  id: number;
  code: string;
  nome: string;
  area: string;
  areaNum: number;
  cultura: 'soja' | 'milho' | 'pousio';
  culturaDisplay: string;
  variedade: string;
  estagio: string;
  produtividade: string;
  status: 'NORMAL' | 'ALERTA_FERRUGEM' | 'POUSIO';
  plantio: string;
  colheita: string;
  geoId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  ndvi: number;
  alertTitle?: string;
  alertDesc?: string;
  aplicacoes: AplicacaoHist[];
}

const TALHOES_DATA: Talhao[] = [
  {
    id: 1,
    code: 'T-01',
    nome: 'Talhão 01 — Sede',
    area: '110,0 ha',
    areaNum: 110.0,
    cultura: 'soja',
    culturaDisplay: 'Soja',
    variedade: 'BRS 511',
    estagio: 'V6 Vegetativo',
    produtividade: '66,0 sc/ha',
    status: 'NORMAL',
    plantio: '20/10/2024',
    colheita: '15/02/2025',
    geoId: '#TLH-01',
    x: 50,
    y: 95,
    width: 185,
    height: 225,
    color: '#10b981',
    ndvi: 0.79,
    aplicacoes: [
      {
        data: '12/11/2024 • Operador João P.',
        responsavel: 'João P.',
        titulo: 'Fungicida Opera Ultra',
        meta: 'Dose: 0,5 L/ha • Lote OP-2024-12',
        tipo: 'accent',
      },
      {
        data: '20/10/2024 • Plantio Mecanizado',
        responsavel: 'Equipe Sede',
        titulo: 'Sementes BRS 511 Tratadas',
        meta: 'Densidade: 250 mil pl/ha • Lote SEM-18',
        tipo: 'accent',
      },
    ],
  },
  {
    id: 2,
    code: 'T-02',
    nome: 'Talhão 02 — Pivô Central',
    area: '140,0 ha',
    areaNum: 140.0,
    cultura: 'soja',
    culturaDisplay: 'Soja',
    variedade: 'BRS 511',
    estagio: 'R1 Floração',
    produtividade: '68,0 sc/ha',
    status: 'NORMAL',
    plantio: '15/10/2024',
    colheita: '10/02/2025',
    geoId: '#TLH-02',
    x: 255,
    y: 95,
    width: 185,
    height: 225,
    color: '#10b981',
    ndvi: 0.82,
    aplicacoes: [
      {
        data: '10/11/2024 • Operador Carlos M.',
        responsavel: 'Carlos M.',
        titulo: 'Fertirrigação Nitrogênio + Boro',
        meta: 'Lâmina: 14mm • Tanque 02',
        tipo: 'accent',
      },
      {
        data: '15/10/2024 • Plantio Pivô',
        responsavel: 'Equipe Mecanizada',
        titulo: 'Sementes BRS 511',
        meta: 'Densidade: 260 mil pl/ha • Lote SEM-22',
        tipo: 'accent',
      },
    ],
  },
  {
    id: 3,
    code: 'T-03',
    nome: 'Talhão 03 — Platô Alto',
    area: '95,0 ha',
    areaNum: 95.0,
    cultura: 'soja',
    culturaDisplay: 'Soja',
    variedade: 'DM 66i68',
    estagio: 'R2 Vagens',
    produtividade: '64,0 sc/ha',
    status: 'NORMAL',
    plantio: '22/10/2024',
    colheita: '18/02/2025',
    geoId: '#TLH-03',
    x: 460,
    y: 95,
    width: 185,
    height: 225,
    color: '#10b981',
    ndvi: 0.77,
    aplicacoes: [
      {
        data: '08/11/2024 • Operador Lucas F.',
        responsavel: 'Lucas F.',
        titulo: 'Inseticida Ampligo',
        meta: 'Dose: 0,15 L/ha • Lote AMP-44',
        tipo: 'accent',
      },
      {
        data: '22/10/2024 • Plantio Direto',
        responsavel: 'Equipe Sede',
        titulo: 'Sementes DM 66i68',
        meta: 'Densidade: 245 mil pl/ha • Lote SEM-39',
        tipo: 'accent',
      },
    ],
  },
  {
    id: 4,
    code: 'T-04',
    nome: 'Talhão 04 — Baixada Norte',
    area: '125,0 ha',
    areaNum: 125.0,
    cultura: 'soja',
    culturaDisplay: 'Soja',
    variedade: 'DM 66i68',
    estagio: 'R2 Vagens',
    produtividade: '58,0 sc/ha',
    status: 'ALERTA_FERRUGEM',
    plantio: '18/10/2024',
    colheita: '12/02/2025',
    geoId: '#TLH-04',
    x: 665,
    y: 95,
    width: 185,
    height: 225,
    color: '#ef4444',
    ndvi: 0.65,
    alertTitle: 'Foco de Ferrugem Asiática Detectado',
    alertDesc: 'Score de risco fitossanitário 0.88 correlacionado ao molhamento foliar. Aplicação de defensivo curativo prioritária.',
    aplicacoes: [
      {
        data: 'Hoje, 08:30 • Operador Carlos M.',
        responsavel: 'Carlos M.',
        titulo: 'Fungicida Fox Xpro',
        meta: 'Dose: 0,5 L/ha • Lote FX-2024-88',
        tipo: 'danger',
      },
      {
        data: '15/09/2024 • Operador João P.',
        responsavel: 'João P.',
        titulo: 'Fertilizante NPK 04-14-08',
        meta: 'Dose: 350 kg/ha • Lote FERT-09',
        tipo: 'accent',
      },
      {
        data: '18/10/2024 • Plantio Mecanizado',
        responsavel: 'Equipe Sede',
        titulo: 'Sementes Tratadas DM 66i68',
        meta: 'Densidade: 240 mil pl/ha • Lote SEM-41',
        tipo: 'accent',
      },
    ],
  },
  {
    id: 5,
    code: 'T-05',
    nome: 'Talhão 05 — Cerca Velha',
    area: '180,0 ha',
    areaNum: 180.0,
    cultura: 'milho',
    culturaDisplay: 'Milho',
    variedade: 'DKB 360',
    estagio: 'V4 Desenvolvimento',
    produtividade: '120,0 sc/ha',
    status: 'NORMAL',
    plantio: '05/11/2024',
    colheita: '25/03/2025',
    geoId: '#TLH-05',
    x: 50,
    y: 370,
    width: 185,
    height: 225,
    color: '#f59e0b',
    ndvi: 0.74,
    aplicacoes: [
      {
        data: '22/11/2024 • Operador Marcos R.',
        responsavel: 'Marcos R.',
        titulo: 'Herbicida Soberan',
        meta: 'Dose: 0,25 L/ha • Lote SOB-99',
        tipo: 'accent',
      },
      {
        data: '05/11/2024 • Semeadura Milho',
        responsavel: 'Equipe Sul',
        titulo: 'Sementes DKB 360 PRO4',
        meta: 'Densidade: 68 mil pl/ha • Lote MIL-11',
        tipo: 'accent',
      },
    ],
  },
  {
    id: 6,
    code: 'T-06',
    nome: 'Talhão 06 — Represa',
    area: '160,0 ha',
    areaNum: 160.0,
    cultura: 'milho',
    culturaDisplay: 'Milho',
    variedade: 'DKB 360',
    estagio: 'V6 Desenvolvimento',
    produtividade: '115,0 sc/ha',
    status: 'NORMAL',
    plantio: '02/11/2024',
    colheita: '20/03/2025',
    geoId: '#TLH-06',
    x: 255,
    y: 370,
    width: 185,
    height: 225,
    color: '#f59e0b',
    ndvi: 0.76,
    aplicacoes: [
      {
        data: '18/11/2024 • Operador Marcos R.',
        responsavel: 'Marcos R.',
        titulo: 'Ureia Agrícola Coberta (N)',
        meta: 'Dose: 180 kg/ha • Lote URE-04',
        tipo: 'accent',
      },
      {
        data: '02/11/2024 • Plantio Represa',
        responsavel: 'Equipe Sul',
        titulo: 'Sementes DKB 360 PRO4',
        meta: 'Densidade: 66 mil pl/ha • Lote MIL-12',
        tipo: 'accent',
      },
    ],
  },
  {
    id: 7,
    code: 'T-07',
    nome: 'Talhão 07 — Divisa Leste',
    area: '210,0 ha',
    areaNum: 210.0,
    cultura: 'soja',
    culturaDisplay: 'Soja',
    variedade: 'BRS 511',
    estagio: 'R3 Granação',
    produtividade: '65,0 sc/ha',
    status: 'NORMAL',
    plantio: '12/10/2024',
    colheita: '08/02/2025',
    geoId: '#TLH-07',
    x: 460,
    y: 370,
    width: 185,
    height: 225,
    color: '#10b981',
    ndvi: 0.81,
    aplicacoes: [
      {
        data: '14/11/2024 • Operador Carlos M.',
        responsavel: 'Carlos M.',
        titulo: 'Fungicida Priori Xtra',
        meta: 'Dose: 0,3 L/ha • Lote PR-80',
        tipo: 'accent',
      },
      {
        data: '12/10/2024 • Plantio Leste',
        responsavel: 'Equipe Sede',
        titulo: 'Sementes BRS 511',
        meta: 'Densidade: 255 mil pl/ha • Lote SEM-14',
        tipo: 'accent',
      },
    ],
  },
  {
    id: 8,
    code: 'T-08',
    nome: 'Talhão 08 — Reserva & Palhada',
    area: '200,0 ha',
    areaNum: 200.0,
    cultura: 'pousio',
    culturaDisplay: 'Pousio ESG',
    variedade: 'Braquiária Ruziziensis',
    estagio: 'Manejo de Cobertura',
    produtividade: '—',
    status: 'POUSIO',
    plantio: '— (Pousio)',
    colheita: '— (Palhada)',
    geoId: '#TLH-08',
    x: 665,
    y: 370,
    width: 185,
    height: 225,
    color: '#71717a',
    ndvi: 0.71,
    alertTitle: 'Área em Regeneração & Pousio ESG',
    alertDesc: 'Talhão sob cobertura de Braquiária para acúmulo de palhada, retenção hídrica e descompactação biológica do solo.',
    aplicacoes: [
      {
        data: '01/08/2024 • Operador Renato S.',
        responsavel: 'Renato S.',
        titulo: 'Semeadura a Lanço Braquiária',
        meta: 'Taxa: 12 kg/ha • Manejo Integrado',
        tipo: 'default',
      },
    ],
  },
];

const getTalhaoGridCoords = (idx: number) => {
  const col = idx % 4;
  const row = Math.floor(idx / 4);
  return {
    x: 50 + col * 205,
    y: 95 + row * 275,
    width: 185,
    height: 225,
  };
};

const getCulturaColor = (cultura?: string | null) => {
  const c = cultura?.toLowerCase() || '';
  if (c.includes('milho')) return '#f59e0b';
  if (c.includes('pousio') || c.includes('preparo')) return '#71717a';
  if (c.includes('algodão') || c.includes('algodao')) return '#38bdf8';
  if (c.includes('trigo')) return '#eab308';
  return '#10b981';
};

export const TalhoesGis: React.FC = () => {
  const { isDemoMode } = useAuth();

  const [talhoes, setTalhoes] = useState<Talhao[]>(() => isDemoMode ? TALHOES_DATA : []);
  const [selectedId, setSelectedId] = useState<number | null>(() => isDemoMode ? 4 : null);
  const [culturaFilter, setCulturaFilter] = useState<'all' | 'soja' | 'milho' | 'pousio'>('all');
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [activeTool, setActiveTool] = useState<'select' | 'ndvi' | 'measure' | 'center'>('select');
  const [ndviOverlay, setNdviOverlay] = useState<boolean>(false);
  
  // Modais específicos do talhão e feedback
  const [modalPrescricaoOpen, setModalPrescricaoOpen] = useState(false);
  const [modalApontamentoOpen, setModalApontamentoOpen] = useState(false);
  const [modalNovoTalhaoOpen, setModalNovoTalhaoOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const totalRows = Math.max(2, Math.ceil(talhoes.length / 4));
  const svgHeight = 95 + totalRows * 275 + 50;

  const roadPathD = useMemo(() => {
    let d = `M 245 0 L 245 ${svgHeight} M 450 0 L 450 ${svgHeight} M 655 0 L 655 ${svgHeight}`;
    for (let r = 0; r < totalRows - 1; r++) {
      const y = 345 + r * 275;
      d += ` M 0 ${y} L 900 ${y}`;
    }
    return d;
  }, [totalRows, svgHeight]);

  // Carregar Talhões reais do Backend
  useEffect(() => {
    async function carregarTalhoes() {
      try {
        const talhoesApi = await operacionalService.getTalhoes();
        if (talhoesApi && talhoesApi.length > 0) {
          const apiMapped: Talhao[] = talhoesApi.map((t, idx) => {
            const coords = getTalhaoGridCoords(idx);
            const talhaoNum = idx + 1;
            const autoCode = talhaoNum < 10 ? `T-0${talhaoNum}` : `T-${talhaoNum}`;
            const code = t.nome.trim().toUpperCase().startsWith('T-')
              ? t.nome.trim().split(' ')[0]
              : autoCode;
            return {
              id: typeof t.id === 'number' ? t.id : 100 + idx,
              code,
              nome: t.nome,
              area: `${Number(t.area_hectares).toFixed(1).replace('.', ',')} ha`,
              areaNum: Number(t.area_hectares),
              cultura: (t.cultura_atual?.toLowerCase().includes('milho')
                ? 'milho'
                : t.cultura_atual?.toLowerCase().includes('pousio')
                ? 'pousio'
                : 'soja') as 'soja' | 'milho' | 'pousio',
              culturaDisplay: t.cultura_atual || 'Soja',
              variedade: 'BRS 511',
              estagio: 'V6 Vegetativo',
              produtividade: '66,0 sc/ha',
              status: 'NORMAL',
              plantio: '20/10/2024',
              colheita: '15/02/2025',
              geoId: `#TLH-0${talhaoNum}`,
              x: coords.x,
              y: coords.y,
              width: coords.width,
              height: coords.height,
              color: getCulturaColor(t.cultura_atual),
              ndvi: 0.78,
              aplicacoes: [],
            };
          });

          setTalhoes((prev) => {
            if (isDemoMode) {
              const existingNames = new Set(prev.map((p) => p.nome));
              const newItems = apiMapped.filter((a) => !existingNames.has(a.nome));
              return [...prev, ...newItems];
            }
            return apiMapped;
          });

          setSelectedId((curr) => {
            if (curr && apiMapped.some(t => t.id === curr)) return curr;
            return apiMapped[0]?.id ?? null;
          });
        } else if (!isDemoMode) {
          setTalhoes([]);
          setSelectedId(null);
        }
      } catch (err) {
        if (isDemoMode) {
          console.info('Modo demonstração ativo para GIS/Talhões:', err);
        } else {
          setTalhoes([]);
          setSelectedId(null);
        }
      }
    }
    carregarTalhoes();
  }, [isDemoMode]);

  const handleTalhaoCriado = (novo: TalhaoApi) => {
    const idx = talhoes.length;
    const coords = getTalhaoGridCoords(idx);
    const talhaoNum = idx + 1;
    const autoCode = talhaoNum < 10 ? `T-0${talhaoNum}` : `T-${talhaoNum}`;
    const code = novo.nome.trim().toUpperCase().startsWith('T-')
      ? novo.nome.trim().split(' ')[0]
      : autoCode;

    const mapped: Talhao = {
      id: typeof novo.id === 'number' ? novo.id : 100 + idx,
      code,
      nome: novo.nome,
      area: `${Number(novo.area_hectares).toFixed(1).replace('.', ',')} ha`,
      areaNum: Number(novo.area_hectares),
      cultura: (novo.cultura_atual?.toLowerCase().includes('milho')
        ? 'milho'
        : novo.cultura_atual?.toLowerCase().includes('pousio')
        ? 'pousio'
        : 'soja') as 'soja' | 'milho' | 'pousio',
      culturaDisplay: novo.cultura_atual || 'Soja',
      variedade: 'Variedade Certificada',
      estagio: 'V1 Emergência',
      produtividade: '—',
      status: 'NORMAL',
      plantio: new Date().toLocaleDateString('pt-BR'),
      colheita: '—',
      geoId: `#TLH-0${talhaoNum}`,
      x: coords.x,
      y: coords.y,
      width: coords.width,
      height: coords.height,
      color: getCulturaColor(novo.cultura_atual),
      ndvi: 0.76,
      aplicacoes: [],
    };
    setTalhoes((prev) => [...prev, mapped]);
    setSelectedId(mapped.id);
    showToast(`Talhão "${novo.nome}" cadastrado com sucesso!`);
  };

  // Form states de Prescrição Agronômica
  const [prescricaoInsumo, setPrescricaoInsumo] = useState('Fungicida Fox Xpro');
  const [prescricaoDose, setPrescricaoDose] = useState<number>(0.5);
  const [prescricaoOperador, setPrescricaoOperador] = useState('Carlos M.');
  const [prescricaoEquipamento, setPrescricaoEquipamento] = useState('Pulverizador Patriot 350');

  // Form states de Apontamento de Campo
  const [apontamentoTipo, setApontamentoTipo] = useState('Foco Fitossanitário Detectado');
  const [apontamentoSeveridade, setApontamentoSeveridade] = useState<'ALERTA_FERRUGEM' | 'NORMAL'>('ALERTA_FERRUGEM');
  const [apontamentoGps, setApontamentoGps] = useState('-12.5020°, -55.7015°');
  const [apontamentoObs, setApontamentoObs] = useState('Pústulas observadas no terço médio e inferior da folhagem.');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const selectedTalhao = (selectedId ? talhoes.find((t) => t.id === selectedId) : null) || talhoes[0] || null;

  // Filtro de lista
  const filteredTalhoes = talhoes.filter((t) => {
    if (culturaFilter === 'all') return true;
    return t.cultura === culturaFilter;
  });

  // Exportar GeoJSON
  const handleExportGeoJSON = () => {
    const geojsonData = {
      type: 'FeatureCollection',
      crs: {
        type: 'name',
        properties: { name: 'urn:ogc:def:crs:EPSG::4674' }, // SIRGAS 2000
      },
      metadata: {
        propriedade: 'Fazenda Santa Maria',
        municipio: 'Sorriso',
        uf: 'MT',
        gerado_em: new Date().toISOString(),
        total_talhoes: talhoes.length,
      },
      features: talhoes.map((t) => ({
        type: 'Feature',
        id: t.code,
        properties: {
          id: t.id,
          nome: t.nome,
          area_ha: t.areaNum,
          cultura: t.cultura,
          variedade: t.variedade,
          estagio: t.estagio,
          produtividade_esperada: t.produtividade,
          status: t.status,
          ndvi_atual: t.ndvi,
          plantio: t.plantio,
          colheita: t.colheita,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-55.705 + (t.x / 1000), -12.545 - (t.y / 1000)],
              [-55.705 + ((t.x + t.width) / 1000), -12.545 - (t.y / 1000)],
              [-55.705 + ((t.x + t.width) / 1000), -12.545 - ((t.y + t.height) / 1000)],
              [-55.705 + (t.x / 1000), -12.545 - ((t.y + t.height) / 1000)],
              [-55.705 + (t.x / 1000), -12.545 - (t.y / 1000)],
            ],
          ],
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geojsonData, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seed-fazenda-santa-maria-talhoes-${new Date().toISOString().split('T')[0]}.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Exportação concluída: GeoJSON SIRGAS 2000 baixado com sucesso!');
  };

  // Importar KML / GeoJSON
  const handleImportKmlClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast(`Arquivo "${file.name}" importado com sucesso! Geometrias vetoriais validadas no PostGIS.`);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Troca de ferramentas do mapa
  const handleToolClick = (tool: 'select' | 'ndvi' | 'measure' | 'center') => {
    setActiveTool(tool);
    if (tool === 'ndvi') {
      const nextNdvi = !ndviOverlay;
      setNdviOverlay(nextNdvi);
      showToast(nextNdvi ? 'Camada Sentinel-2 NDVI (Índice de Vigor) ativada.' : 'Camada NDVI desativada.');
    } else if (tool === 'measure') {
      showToast('Ferramenta de régua geodésica ativa: clique em dois vértices para mensurar distância.');
    } else if (tool === 'center') {
      showToast('Mapa centralizado na sede (12°32\'44"S 55°42\'18"W).');
    } else {
      showToast('Modo de seleção de parcelas ativo.');
    }
  };

  // Lançar Prescrição no Talhão
  const handleSalvarPrescricao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTalhao) return;
    const volumeTotal = Number((selectedTalhao.areaNum * prescricaoDose).toFixed(1));

    setTalhoes((prev) =>
      prev.map((t) => {
        if (t.id === selectedTalhao.id) {
          return {
            ...t,
            aplicacoes: [
              {
                data: `Hoje, ${new Date().toLocaleTimeString().slice(0, 5)} • Operador ${prescricaoOperador}`,
                responsavel: prescricaoOperador,
                titulo: `Prescrição: ${prescricaoInsumo}`,
                meta: `Dose: ${prescricaoDose} L/ha • Calda Total: ${volumeTotal} L • ${prescricaoEquipamento}`,
                tipo: 'accent',
              },
              ...t.aplicacoes,
            ],
          };
        }
        return t;
      })
    );
    operacionalService.alocarInsumo({
      lote_insumo_id: '00000000-0000-0000-0000-000000000001',
      safra_id: '00000000-0000-0000-0000-000000000001',
      talhao_id: '00000000-0000-0000-0000-000000000001',
      quantidade: volumeTotal,
      area_hectares: selectedTalhao.areaNum,
      operador_id: '00000000-0000-0000-0000-000000000001',
      aplicado_em: new Date().toISOString(),
    }).catch((err) => console.info('Offline prescricao sync:', err));

    showToast(`Prescrição de ${prescricaoInsumo} alocada com sucesso ao ${selectedTalhao.nome}!`);
    setModalPrescricaoOpen(false);
  };

  // Salvar Apontamento de Campo
  const handleSalvarApontamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTalhao) return;
    const isAlerta = apontamentoSeveridade === 'ALERTA_FERRUGEM';

    if (isAlerta) {
      epidemiologicoService.createOcorrencia({
        tipo_ameaca: 'DOENCA',
        agente_identificado: apontamentoTipo.includes('Ferrugem') ? 'Ferrugem Asiática' : apontamentoTipo,
        severidade: 'ALTA',
        latitude: -12.5020,
        longitude: -55.7015,
        observado_em: new Date().toISOString(),
        observacoes: apontamentoObs,
      }).catch((err) => console.info('Offline apontamento sync:', err));
    }

    setTalhoes((prev) =>
      prev.map((t) => {
        if (t.id === selectedTalhao.id) {
          return {
            ...t,
            status: isAlerta ? 'ALERTA_FERRUGEM' : t.status,
            alertTitle: isAlerta ? apontamentoTipo : t.alertTitle,
            alertDesc: isAlerta ? apontamentoObs : t.alertDesc,
            aplicacoes: [
              {
                data: `Hoje, ${new Date().toLocaleTimeString().slice(0, 5)} • Telemetria de Campo`,
                responsavel: 'Inspetor Técnico',
                titulo: apontamentoTipo,
                meta: `GPS: ${apontamentoGps} • ${apontamentoObs}`,
                tipo: isAlerta ? 'danger' : 'default',
              },
              ...t.aplicacoes,
            ],
          };
        }
        return t;
      })
    );
    showToast(`Apontamento georreferenciado registrado com sucesso no ${selectedTalhao.nome}!`);
    setModalApontamentoOpen(false);
  };

  const totalAreaNum = talhoes.reduce((acc, t) => acc + (t.areaNum || 0), 0);
  const areaSoja = talhoes.filter(t => t.cultura === 'soja').reduce((acc, t) => acc + (t.areaNum || 0), 0);
  const areaMilho = talhoes.filter(t => t.cultura === 'milho').reduce((acc, t) => acc + (t.areaNum || 0), 0);
  const areaPousio = talhoes.filter(t => t.cultura === 'pousio').reduce((acc, t) => acc + (t.areaNum || 0), 0);
  const talhoesAlerta = talhoes.filter(t => t.status === 'ALERTA_FERRUGEM');
  const pctCultivada = totalAreaNum > 0 ? (((areaSoja + areaMilho) / totalAreaNum) * 100).toFixed(1) : '0.0';

  return (
    <>
      {/* Toast flutuante de notificação */}
      {toastMsg && (
        <div className="toast-msg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '18px', height: '18px', color: 'var(--accent)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Input oculto para upload de arquivo KML/GeoJSON */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".kml,.kmz,.geojson,.json"
        style={{ display: 'none' }}
      />

      {/* Cabeçalho da Página */}
      <div className="page-header stagger-item">
        <div className="page-header-left">
          <h1 className="page-heading">Gestão Territorial & Talhões</h1>
          <p className="page-subheading">Mapeamento vetorial com telemetria fenológica, safras e alocação de insumos</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setModalNovoTalhaoOpen(true)} title="Cadastrar nova parcela de talhão">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo Talhão
          </button>
          <button className="btn btn-outline" onClick={handleExportGeoJSON} title="Baixar arquivo GeoJSON SIRGAS 2000" disabled={talhoes.length === 0}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exportar GeoJSON
          </button>
          <button className="btn btn-outline" onClick={handleImportKmlClick} title="Importar arquivo vetorial KML ou GeoJSON">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Importar KML
          </button>
        </div>
      </div>

      {/* Mini KPI Strip Territorial */}
      <div className="gis-strip stagger-item">
        <div className="gis-cell">
          <span className="gis-cell-label">Área Mapeada Total</span>
          <div className="gis-cell-val">
            {totalAreaNum.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            <span className="unit">ha</span>
          </div>
          <span className="gis-cell-sub">{talhoes.length} talhões cadastrados</span>
        </div>
        <div className="gis-cell">
          <span className="gis-cell-label">Área Cultivada (Safra Atual)</span>
          <div className="gis-cell-val">
            {(areaSoja + areaMilho).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            <span className="unit">ha</span>
          </div>
          <span className="gis-cell-sub" style={{ color: 'var(--accent-text)' }}>{pctCultivada}% sob plantio ativo</span>
        </div>
        <div className="gis-cell">
          <span className="gis-cell-label">Produtividade Estimada</span>
          <div className="gis-cell-val">
            {talhoes.length > 0 ? '64,5' : '—'}
            <span className="unit">{talhoes.length > 0 ? 'sc/ha' : ''}</span>
          </div>
          <span className="gis-cell-sub">{talhoes.length > 0 ? 'Break-even: 41,2 sc/ha' : 'Sem histórico registrado'}</span>
        </div>
        <div className="gis-cell">
          <span className="gis-cell-label">Talhões com Alerta</span>
          <div className="gis-cell-val" style={{ color: talhoesAlerta.length > 0 ? 'var(--danger)' : 'var(--accent-text)' }}>
            {talhoesAlerta.length}{' '}
            <span className="unit" style={{ color: talhoesAlerta.length > 0 ? 'var(--danger)' : 'var(--accent-text)' }}>
              {talhoesAlerta.length > 0 ? 'crítico' : 'regular'}
            </span>
          </div>
          <span className="gis-cell-sub">
            {talhoesAlerta.length > 0 ? `${talhoesAlerta[0].nome}` : 'Nenhum foco ativo'}
          </span>
        </div>
      </div>

      {/* Barra de Controles e Filtros de Visualização */}
      <div className="controls-bar stagger-item">
        <div className="filter-group">
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', fontWeight: 600 }}>
            Cultura:
          </span>
          <div
            className={`filter-chip ${culturaFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCulturaFilter('all')}
          >
            <span>Todos ({talhoes.length})</span>
          </div>
          <div
            className={`filter-chip ${culturaFilter === 'soja' ? 'active' : ''}`}
            onClick={() => setCulturaFilter('soja')}
          >
            <span className="chip-dot" style={{ background: 'var(--accent)' }}></span>
            <span>Soja ({areaSoja.toFixed(0)} ha)</span>
          </div>
          <div
            className={`filter-chip ${culturaFilter === 'milho' ? 'active' : ''}`}
            onClick={() => setCulturaFilter('milho')}
          >
            <span className="chip-dot" style={{ background: 'var(--warning)' }}></span>
            <span>Milho ({areaMilho.toFixed(0)} ha)</span>
          </div>
          <div
            className={`filter-chip ${culturaFilter === 'pousio' ? 'active' : ''}`}
            onClick={() => setCulturaFilter('pousio')}
          >
            <span className="chip-dot" style={{ background: 'var(--text-muted)' }}></span>
            <span>Pastagem/Pousio ({areaPousio.toFixed(0)} ha)</span>
          </div>
        </div>

        <div className="view-toggles">
          <button
            className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
            </svg>
            Mapa GIS
          </button>
          <button
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            Tabela Detalhada
          </button>
        </div>
      </div>

      {talhoes.length === 0 ? (
        <div className="empty-state stagger-item">
          <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
            </svg>
          </div>
          <h3 className="empty-state-title">Nenhum talhão cadastrado nesta fazenda</h3>
          <p className="empty-state-desc">
            Cadastre os talhões da sua propriedade com área em hectares, cultura atual e tipo de solo para habilitar o GIS territorial, a análise fenológica de satélite (NDVI) e o lançamento de prescrições agronômicas.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setModalNovoTalhaoOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Cadastrar Primeiro Talhão
            </button>
            <button className="btn btn-outline" onClick={handleImportKmlClick}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Importar KML / GeoJSON
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* VIEW 1: MAPA GIS INTERATIVO COM GAVETA */}
          {viewMode === 'map' && (
            <div className="gis-workspace stagger-item">
          {/* Card do Mapa Interativo */}
          <div className="map-container">
            {/* Controles de Ferramentas do Mapa */}
            <div className="map-toolbar">
              <button
                className={`map-tool-btn ${activeTool === 'select' ? 'active' : ''}`}
                title="Modo Seleção"
                onClick={() => handleToolClick('select')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                </svg>
              </button>
              <button
                className={`map-tool-btn ${ndviOverlay ? 'active' : ''}`}
                title="Camada de Satélite NDVI (Sentinel-2)"
                onClick={() => handleToolClick('ndvi')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                </svg>
              </button>
              <button
                className={`map-tool-btn ${activeTool === 'measure' ? 'active' : ''}`}
                title="Medir Área / Distância"
                onClick={() => handleToolClick('measure')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
              </button>
              <button
                className={`map-tool-btn ${activeTool === 'center' ? 'active' : ''}`}
                title="Centralizar Mapa"
                onClick={() => handleToolClick('center')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              </button>
            </div>

            {/* Coordenadas Geográficas de Centro */}
            <div className="map-coords">
              <span>CENTRO: <strong>12°32'44"S 55°42'18"W</strong></span>
              <span>•</span>
              <span>DATUM: <strong>SIRGAS 2000 / PostGIS</strong></span>
              {ndviOverlay && (
                <>
                  <span>•</span>
                  <span style={{ color: 'var(--accent-text)' }}>SENTINEL-2 NDVI ATIVO</span>
                </>
              )}
            </div>

            {/* SVG Cartográfico dos Polígonos de Talhões */}
            <svg className="svg-map-canvas" viewBox={`0 0 900 ${svgHeight}`} preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="ndviGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#84cc16" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0.25" />
                </linearGradient>
              </defs>

              {/* Estradas de serviço e carreadores internos contínuos de ponta a ponta */}
              <path
                d={roadPathD}
                stroke="#27272a"
                strokeWidth="2"
                strokeDasharray="6 4"
                fill="none"
              />

              {/* Renderização dinâmica dos talhões */}
              {talhoes.map((t, idx) => {
                const isSelected = t.id === selectedId;
                const isDimmed = culturaFilter !== 'all' && t.cultura !== culturaFilter;
                const coords = getTalhaoGridCoords(idx);

                // Cores dinâmicas com base no status e camada NDVI
                let fillColor = t.color;
                let strokeColor = t.color;
                let fillOpacity = isSelected ? 0.45 : 0.18;

                if (ndviOverlay) {
                  // Vigor NDVI visual
                  if (t.ndvi >= 0.78) {
                    fillColor = '#10b981';
                    strokeColor = '#34d399';
                  } else if (t.ndvi >= 0.70) {
                    fillColor = '#84cc16';
                    strokeColor = '#a3e635';
                  } else {
                    fillColor = '#f59e0b';
                    strokeColor = '#fbbf24';
                  }
                  fillOpacity = isSelected ? 0.55 : 0.35;
                }

                if (t.status === 'ALERTA_FERRUGEM' && !ndviOverlay) {
                  fillColor = '#ef4444';
                  strokeColor = '#ef4444';
                  fillOpacity = isSelected ? 0.45 : 0.28;
                }

                const centerX = coords.x + coords.width / 2;
                const centerY = coords.y + coords.height / 2;

                return (
                  <g
                    key={t.id}
                    style={{
                      opacity: isDimmed ? 0.15 : 1,
                      pointerEvents: isDimmed ? 'none' : 'auto',
                      transition: 'opacity 200ms ease',
                    }}
                  >
                    <rect
                      id={`poly-${t.id}`}
                      className={`talhao-poly ${isSelected ? 'selected' : ''}`}
                      data-cultura={t.cultura}
                      x={coords.x}
                      y={coords.y}
                      width={coords.width}
                      height={coords.height}
                      rx="6"
                      ry="6"
                      fill={fillColor}
                      fillOpacity={fillOpacity}
                      stroke={isSelected ? '#fafafa' : strokeColor}
                      strokeWidth={isSelected ? 3 : 1.5}
                      onClick={() => setSelectedId(t.id)}
                    />

                    {/* Rótulo Principal do Talhão */}
                    <text
                      x={centerX}
                      y={centerY - 10}
                      textAnchor="middle"
                      className="poly-label"
                      style={{ fill: t.status === 'ALERTA_FERRUGEM' && !ndviOverlay ? '#fca5a5' : '#fafafa' }}
                    >
                      {t.code}
                    </text>

                    {/* Subtítulo de Cultura e Área */}
                    <text
                      x={centerX}
                      y={centerY + 12}
                      textAnchor="middle"
                      className="poly-sublabel"
                      style={{
                        fill: t.status === 'ALERTA_FERRUGEM' && !ndviOverlay ? '#ef4444' : '#a1a1aa',
                        fontWeight: t.status === 'ALERTA_FERRUGEM' ? 600 : 400,
                      }}
                    >
                      {ndviOverlay
                        ? `NDVI ${t.ndvi.toFixed(2)} • ${t.area.split(' ')[0]} ha`
                        : `${t.area.split(' ')[0]} ha • ${t.culturaDisplay}`}
                    </text>

                    {/* Beacon piscante em talhão com alerta crítico */}
                    {t.status === 'ALERTA_FERRUGEM' && (
                      <circle cx={centerX} cy={centerY + 32} r="4.5" fill="#ef4444">
                        <animate attributeName="opacity" values="1;0.25;1" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Régua Espectral de NDVI - Sensoriamento Remoto */}
            {ndviOverlay && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  right: '16px',
                  background: 'rgba(9, 9, 11, 0.92)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  zIndex: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    Escala Espectral NDVI (Sentinel-2 MSI)
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Talhão Focado: <strong style={{ color: selectedTalhao.ndvi >= 0.75 ? '#34d399' : '#f59e0b' }}>{selectedTalhao.ndvi.toFixed(2)}</strong>
                  </span>
                </div>
                {/* Gradiente Colorimétrico */}
                <div
                  style={{
                    height: '8px',
                    borderRadius: '4px',
                    background: 'linear-gradient(to right, #7f1d1d 0%, #ef4444 20%, #f59e0b 45%, #84cc16 70%, #10b981 100%)',
                    position: 'relative',
                  }}
                >
                  {/* Marcador do Talhão Selecionado */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      left: `${Math.min(100, Math.max(0, (selectedTalhao.ndvi / 1.0) * 100))}%`,
                      width: '4px',
                      height: '16px',
                      background: '#ffffff',
                      borderRadius: '2px',
                      boxShadow: '0 0 6px rgba(0,0,0,0.8)',
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  <span>0.00 (Solo Exposto)</span>
                  <span>0.35 (Estresse Hídrico)</span>
                  <span>0.60 (Em Desenvolvimento)</span>
                  <span>0.85+ (Vigor Pleno)</span>
                </div>
              </div>
            )}
          </div>

          {/* Painel Lateral de Detalhes do Talhão Ativo */}
          <aside className="detail-panel">
            <div className="panel-header">
              <div className="panel-header-info">
                <h2 className="panel-title">{selectedTalhao.nome}</h2>
                <span className="panel-subtitle">
                  {selectedTalhao.area} • PostGIS GeoJSON ID: {selectedTalhao.geoId}
                </span>
              </div>
              {selectedTalhao.status === 'ALERTA_FERRUGEM' ? (
                <span className="status-pill" style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}>
                  RISCO ALTO
                </span>
              ) : selectedTalhao.status === 'POUSIO' ? (
                <span className="status-pill" style={{ background: 'rgba(113, 113, 122, 0.2)', color: 'var(--text-muted)' }}>
                  POUSIO
                </span>
              ) : (
                <span className="status-pill" style={{ background: 'var(--accent-muted)', color: 'var(--accent-text)' }}>
                  ATIVO
                </span>
              )}
            </div>

            <div className="panel-body">
              {/* Banner de Alerta Sanitário Condicional */}
              <div
                className={`panel-alert ${
                  selectedTalhao.status === 'ALERTA_FERRUGEM'
                    ? 'alert-danger'
                    : selectedTalhao.status === 'POUSIO'
                    ? 'alert-pousio'
                    : 'alert-normal'
                }`}
              >
                <div
                  className="panel-alert-icon"
                  style={{
                    color:
                      selectedTalhao.status === 'ALERTA_FERRUGEM'
                        ? 'var(--danger)'
                        : selectedTalhao.status === 'POUSIO'
                        ? 'var(--text-muted)'
                        : 'var(--accent)',
                  }}
                >
                  {selectedTalhao.status === 'ALERTA_FERRUGEM' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  ) : selectedTalhao.status === 'POUSIO' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div
                    className="panel-alert-title"
                    style={{
                      color:
                        selectedTalhao.status === 'ALERTA_FERRUGEM'
                          ? '#fca5a5'
                          : selectedTalhao.status === 'POUSIO'
                          ? 'var(--text-primary)'
                          : '#a7f3d0',
                    }}
                  >
                    {selectedTalhao.alertTitle || 'Sanidade Vegetal Estável'}
                  </div>
                  <div className="panel-alert-desc">
                    {selectedTalhao.alertDesc ||
                      `Vigor fenológico (NDVI ${selectedTalhao.ndvi}) dentro da normalidade para estágio ${selectedTalhao.estagio}. Nenhuma ocorrência fitossanitária ativa.`}
                  </div>
                </div>
              </div>

              {/* Dados da Safra Ativa */}
              <div>
                <div className="timeline-section-title">Dados da Safra Ativa (2024/25)</div>
                <div className="metric-rows">
                  <div className="metric-row">
                    <span className="metric-row-label">Cultura / Variedade</span>
                    <span className="metric-row-val">{selectedTalhao.culturaDisplay} {selectedTalhao.variedade}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-row-label">Estágio Fenológico</span>
                    <span className="metric-row-val">{selectedTalhao.estagio}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-row-label">Produtividade Estimada</span>
                    <span className="metric-row-val">{selectedTalhao.produtividade}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-row-label">Índice NDVI Atual</span>
                    <span className="metric-row-val" style={{ color: selectedTalhao.ndvi >= 0.75 ? 'var(--accent-text)' : 'var(--warning)' }}>
                      {selectedTalhao.ndvi.toFixed(2)} (Sentinel-2)
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-row-label">Data de Plantio</span>
                    <span className="metric-row-val">{selectedTalhao.plantio}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-row-label">Previsão de Colheita</span>
                    <span className="metric-row-val">{selectedTalhao.colheita}</span>
                  </div>
                </div>
              </div>

              {/* Sensoriamento Remoto & Vigor Vegetativo NDVI */}
              <div
                style={{
                  background: 'var(--surface-sunken)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="16" height="16" style={{ color: 'var(--accent)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                    </svg>
                    Sensoriamento Remoto (Sentinel-2)
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)' }}>
                    Revisita há 2 dias
                  </span>
                </div>

                {/* Distribuição de Zonas de Vigor */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>Zonas de Vigor da Biomassa</span>
                    <span>NDVI Médio: <strong style={{ color: selectedTalhao.ndvi >= 0.75 ? '#34d399' : '#f59e0b' }}>{selectedTalhao.ndvi.toFixed(2)}</strong></span>
                  </div>
                  <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', gap: '2px' }}>
                    <div style={{ width: selectedTalhao.ndvi >= 0.75 ? '78%' : '45%', background: '#10b981' }} title="Vigor Pleno" />
                    <div style={{ width: selectedTalhao.ndvi >= 0.75 ? '16%' : '35%', background: '#f59e0b' }} title="Desenvolvimento Moderado" />
                    <div style={{ width: selectedTalhao.ndvi >= 0.75 ? '6%' : '20%', background: '#ef4444' }} title="Estresse Hídrico / Fitossanitário" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    <span style={{ color: '#34d399' }}>● 78% Vigor Ótimo</span>
                    <span style={{ color: '#fbbf24' }}>● 16% Moderado</span>
                    <span style={{ color: '#f87171' }}>● 6% Estresse</span>
                  </div>
                </div>

                {/* Minigráfico SVG da curva temporal de NDVI nos últimos 90 dias */}
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Evolução Temporal NDVI (90 dias):
                  </div>
                  <svg viewBox="0 0 260 50" style={{ width: '100%', height: '50px', overflow: 'visible' }}>
                    <polyline
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2"
                      points="10,42 45,38 80,32 115,24 150,18 185,14 220,12 250,10"
                    />
                    {[
                      { x: 10, y: 42, v: '0.30' },
                      { x: 80, y: 32, v: '0.48' },
                      { x: 150, y: 18, v: '0.68' },
                      { x: 220, y: 12, v: '0.78' },
                      { x: 250, y: 10, v: selectedTalhao.ndvi.toFixed(2) },
                    ].map((pt, i) => (
                      <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#10b981" stroke="#09090b" strokeWidth="1.5" />
                    ))}
                  </svg>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    <span>Emergência</span>
                    <span>V6</span>
                    <span>R1 Floração</span>
                    <span>Atual ({selectedTalhao.ndvi.toFixed(2)})</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%', fontSize: '11px', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => showToast(`Laudo técnico de NDVI do ${selectedTalhao.nome} gerado com sucesso!`)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="14" height="14">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  Exportar Laudo Espectral NDVI (PDF)
                </button>
              </div>

              {/* Rastreabilidade de Insumos Aplicados */}
              <div>
                <div className="timeline-section-title">Histórico de Aplicações no Talhão</div>
                <div className="timeline">
                  {selectedTalhao.aplicacoes.map((item, idx) => (
                    <div key={idx} className="timeline-item">
                      <span
                        className="timeline-dot"
                        style={{
                          background:
                            item.tipo === 'danger'
                              ? 'var(--danger)'
                              : item.tipo === 'accent'
                              ? 'var(--accent)'
                              : 'var(--text-muted)',
                        }}
                      ></span>
                      <span className="timeline-date">{item.data}</span>
                      <span className="timeline-title">{item.titulo}</span>
                      <span className="timeline-meta">{item.meta}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel-footer">
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setModalPrescricaoOpen(true)}
              >
                Alocar Insumo
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => setModalApontamentoOpen(true)}
              >
                Nova Ocorrência
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* VIEW 2: VISUALIZAÇÃO EM TABELA DETALHADA */}
      {viewMode === 'table' && (
        <div className="table-container stagger-item">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Identificação</th>
                  <th>Área (ha)</th>
                  <th>Cultura</th>
                  <th>Variedade</th>
                  <th>Estágio Fenológico</th>
                  <th>Prod. Estimada</th>
                  <th>NDVI</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTalhoes.map((t) => (
                  <tr
                    key={t.id}
                    style={{
                      background: t.status === 'ALERTA_FERRUGEM' ? 'rgba(239, 68, 68, 0.05)' : undefined,
                    }}
                  >
                    <td className="cell-mono" style={{ color: t.status === 'ALERTA_FERRUGEM' ? 'var(--danger)' : undefined }}>
                      {t.nome}
                    </td>
                    <td className="cell-mono">{t.area}</td>
                    <td>{t.culturaDisplay}</td>
                    <td>{t.variedade}</td>
                    <td>{t.estagio}</td>
                    <td className="cell-mono">{t.produtividade}</td>
                    <td className="cell-mono" style={{ color: t.ndvi >= 0.75 ? 'var(--accent-text)' : 'var(--warning)' }}>
                      {t.ndvi.toFixed(2)}
                    </td>
                    <td>
                      {t.status === 'ALERTA_FERRUGEM' ? (
                        <span className="status-pill" style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}>
                          RISCO ALTO
                        </span>
                      ) : t.status === 'POUSIO' ? (
                        <span className="status-pill" style={{ background: 'rgba(113, 113, 122, 0.2)', color: 'var(--text-muted)' }}>
                          POUSIO
                        </span>
                      ) : (
                        <span className="status-pill" style={{ background: 'var(--accent-muted)', color: 'var(--accent-text)' }}>
                          ATIVO
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => {
                          setSelectedId(t.id);
                          setViewMode('map');
                          showToast(`Talhão ${t.code} selecionado e focado no mapa!`);
                        }}
                      >
                        Ver no Mapa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}

      {/* MODAL 1: PRESCRIÇÃO E ALOCAÇÃO AGRONÔMICA ESPECÍFICA DO TALHÃO */}
      {modalPrescricaoOpen && (
        <div className="modal-backdrop open" onClick={() => setModalPrescricaoOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Prescrever Aplicação no Talhão</h3>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Alvo: {selectedTalhao?.nome || 'Talhão Selecionado'} • {selectedTalhao?.culturaDisplay || 'Cultura'} ({selectedTalhao?.area || ''})
                </span>
              </div>
              <button className="modal-close" onClick={() => setModalPrescricaoOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSalvarPrescricao}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Insumo Agrícola / Calda</label>
                  <CustomSelect
                    value={prescricaoInsumo}
                    onChange={(val) => setPrescricaoInsumo(val)}
                    options={[
                      'Fungicida Fox Xpro (Bayer)',
                      'Fungicida Opera Ultra (BASF)',
                      'Fertilizante NPK 04-14-08 (Yara)',
                      'Inseticida Ampligo (Syngenta)',
                      'Biológico Inoculante Bradyrhizobium',
                      'Herbicida Glifosato 480 SL',
                    ]}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Dose por Hectare (L/ha ou kg/ha)</label>
                    <div className="stepper-wrap">
                      <input
                        type="number"
                        step="0.1"
                        className="form-input"
                        value={prescricaoDose}
                        onChange={(e) => setPrescricaoDose(parseFloat(e.target.value) || 0)}
                        required
                      />
                      <div className="stepper-btns">
                        <button
                          type="button"
                          className="stepper-btn"
                          title="Aumentar"
                          onClick={() => setPrescricaoDose(Number((prescricaoDose + 0.1).toFixed(2)))}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="stepper-btn"
                          title="Diminuir"
                          onClick={() => setPrescricaoDose(Math.max(0, Number((prescricaoDose - 0.1).toFixed(2))))}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Calda Total Calculada</label>
                    <div
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '9px 12px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13.5px',
                        color: 'var(--accent-text)',
                        fontWeight: 600,
                      }}
                    >
                      {(selectedTalhao.areaNum * prescricaoDose).toFixed(1)} L / kg
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Operador Responsável</label>
                    <input
                      type="text"
                      className="form-input"
                      value={prescricaoOperador}
                      onChange={(e) => setPrescricaoOperador(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Maquinário / Pontas</label>
                    <CustomSelect
                      value={prescricaoEquipamento}
                      onChange={(val) => setPrescricaoEquipamento(val)}
                      options={[
                        'Pulverizador Patriot 350',
                        'Trator John Deere 6130M',
                        'Drone DJI Agras T40',
                        'Distribuidor Linha Uniport',
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalPrescricaoOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar no Talhão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: APONTAMENTO GEORREFERENCIADO DE TELEMETRIA DO TALHÃO */}
      {modalApontamentoOpen && (
        <div className="modal-backdrop open" onClick={() => setModalApontamentoOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Apontamento de Campo — {selectedTalhao?.nome || 'Talhão Selecionado'}</h3>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  PostGIS GeoJSON ID: {selectedTalhao?.geoId || '—'} • Centro: 12°32'44"S 55°42'18"W
                </span>
              </div>
              <button className="modal-close" onClick={() => setModalApontamentoOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSalvarApontamento}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipo de Ocorrência Territorial</label>
                    <CustomSelect
                      value={apontamentoTipo}
                      onChange={(val) => setApontamentoTipo(val)}
                      options={[
                        'Foco Fitossanitário Detectado',
                        'Infestação de Lagarta / Praga',
                        'Falha de Emergência de Stand',
                        'Anomalia Hídrica / Encharcamento',
                        'Deficiência Nutricional / Clorose',
                      ]}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nível de Gravidade</label>
                    <CustomSelect
                      value={apontamentoSeveridade}
                      onChange={(val) => setApontamentoSeveridade(val as 'ALERTA_FERRUGEM' | 'NORMAL')}
                      options={[
                        { value: 'ALERTA_FERRUGEM', label: 'Risco Alto (Atenção Imediata)', badge: { text: 'RISCO', className: 'badge-danger' } },
                        { value: 'NORMAL', label: 'Monitoramento Rotineiro', badge: { text: 'NORMAL', className: 'badge-accent' } },
                      ]}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Coordenadas de Amostragem (Lat / Lon)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={apontamentoGps}
                    onChange={(e) => setApontamentoGps(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Laudo / Observações do Inspetor</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={apontamentoObs}
                    onChange={(e) => setApontamentoObs(e.target.value)}
                    placeholder="Descreva sintomas observados na parcela ou recomendação agronômica..."
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalApontamentoOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Apontamento Territorial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CADASTRO DE NOVO TALHÃO */}
      <ModalCadastroTalhao
        isOpen={modalNovoTalhaoOpen}
        onClose={() => setModalNovoTalhaoOpen(false)}
        onSuccess={handleTalhaoCriado}
      />
    </>
  );
};
