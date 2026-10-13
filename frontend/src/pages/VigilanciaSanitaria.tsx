import React, { useState, useMemo, useEffect } from 'react';
import { CustomSelect } from '../components/ui/CustomSelect';
import { epidemiologicoService } from '../services/epidemiologicoService';
import { useSync } from '../context/SyncContext';

export interface OccurrenceItem {
  id: string;
  code: string;
  title: string;
  badge: string;
  badgeClass: 'badge-danger' | 'badge-warn' | 'badge-info' | 'badge-accent';
  date: string;
  timestamp: string;
  agent: string;
  agentScientific: string;
  category: 'FERRUGEM' | 'LAGARTA' | 'PERCEVEJO' | 'ANTRACNOSE' | 'CIGARRINHA';
  talhao: string;
  talhaoShort: string;
  crop: string;
  gps: string;
  severity: string;
  severityLevel: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';
  prescription: string;
  productName: string;
  stockAvailable: string;
  status: 'EM ABERTO' | 'EM TRATAMENTO' | 'MONITORADO' | 'CONTROLADO';
  img: string;
  boxLabel: string;
  confidence: number;
}

const INITIAL_OCCURRENCES: OccurrenceItem[] = [
  {
    id: 'EPI-104',
    code: '#EPI-104',
    title: 'Foco #EPI-104 (Talhão 02)',
    badge: 'CRÍTICO • FERRUGEM',
    badgeClass: 'badge-danger',
    date: 'Hoje, 08:30',
    timestamp: '10/10/2026 08:30',
    agent: 'Ferrugem Asiática',
    agentScientific: 'Phakopsora pachyrhizi',
    category: 'FERRUGEM',
    talhao: 'Talhão 02 • Pivô Central',
    talhaoShort: 'T-02',
    crop: 'Soja Intacta (180 ha)',
    gps: '-12.5000°, -55.7000°',
    severity: '22% Inc. • 8% Sev.',
    severityLevel: 'CRITICA',
    prescription:
      'Aplicação curativa com fungicida sistêmico Azoxistrobina + Ciproconazol (Dose recomendada: 0,30 L/ha). Bloquear pulverização se vento passar de 18 km/h.',
    productName: 'Azoxistrobina + Ciproconazol',
    stockAvailable: '180 L disponíveis no Galpão 01 (suficiente para 600 ha)',
    status: 'EM ABERTO',
    img: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    boxLabel: 'P. pachyrhizi',
    confidence: 98.4,
  },
  {
    id: 'EPI-105',
    code: '#EPI-105',
    title: 'Foco #EPI-105 (Talhão 03)',
    badge: 'ALERTA • DISPERSÃO',
    badgeClass: 'badge-warn',
    date: 'Hoje, 09:15',
    timestamp: '10/10/2026 09:15',
    agent: 'Ferrugem Asiática',
    agentScientific: 'Phakopsora pachyrhizi (Dispersão aérea)',
    category: 'FERRUGEM',
    talhao: 'Talhão 03 • Área Vizinha',
    talhaoShort: 'T-03',
    crop: 'Soja Sul (120 ha)',
    gps: '-12.5015°, -55.6980°',
    severity: '12% Inc. • 3% Sev.',
    severityLevel: 'ALTA',
    prescription:
      'Barreira preventiva com Triazol na borda leste do talhão. Vento sudeste transportando uredósporos procedentes do Talhão 02.',
    productName: 'Priori Xtra + Óleo Mineral',
    stockAvailable: '140 L disponíveis no Galpão 01 (suficiente para 460 ha)',
    status: 'EM TRATAMENTO',
    img: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    boxLabel: 'Dispersão Ativa',
    confidence: 94.2,
  },
  {
    id: 'EPI-103',
    code: '#EPI-103',
    title: 'Foco #EPI-103 (Talhão 05)',
    badge: 'MÉDIO • PERCEVEJO',
    badgeClass: 'badge-info',
    date: '09/10, 16:40',
    timestamp: '09/10/2026 16:40',
    agent: 'Percevejo-marrom',
    agentScientific: 'Euschistus heros',
    category: 'PERCEVEJO',
    talhao: 'Talhão 05 • Milho Alto',
    talhaoShort: 'T-05',
    crop: 'Milho Híbrido (210 ha)',
    gps: '-12.4920°, -55.6890°',
    severity: '1.2 percevejos/m linear',
    severityLevel: 'MEDIA',
    prescription:
      'Aplicação de inseticida específico Clorantraniliprole na fase de formação de grãos para evitar chochamento.',
    productName: 'Ampligo / Clorantraniliprole',
    stockAvailable: '60 L disponíveis no Galpão 02 (suficiente para 400 ha)',
    status: 'MONITORADO',
    img: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
    boxLabel: 'E. heros',
    confidence: 96.1,
  },
  {
    id: 'EPI-102',
    code: '#EPI-102',
    title: 'Foco #EPI-102 (Talhão 04)',
    badge: 'CONTROLADO • LAGARTA',
    badgeClass: 'badge-accent',
    date: '08/10, 11:20',
    timestamp: '08/10/2026 11:20',
    agent: 'Lagarta-do-cartucho',
    agentScientific: 'Spodoptera frugiperda',
    category: 'LAGARTA',
    talhao: 'Talhão 04 • Milho Baixada',
    talhaoShort: 'T-04',
    crop: 'Milho Híbrido (160 ha)',
    gps: '-12.5110°, -55.7050°',
    severity: '3% Incidência (Dano residual)',
    severityLevel: 'BAIXA',
    prescription:
      'Tratamento biológico com Bacillus thuringiensis concluído com 96% de eficácia. Nenhuma ação pendente.',
    productName: 'Bacillus thuringiensis (Biológico)',
    stockAvailable: 'Tratamento finalizado e atestado pelo técnico',
    status: 'CONTROLADO',
    img: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80',
    boxLabel: 'S. frugiperda',
    confidence: 97.8,
  },
];

export const VigilanciaSanitaria: React.FC = () => {
  const { queueOperation } = useSync();
  const [occurrences, setOccurrences] = useState<OccurrenceItem[]>(INITIAL_OCCURRENCES);
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string>('EPI-104');

  useEffect(() => {
    epidemiologicoService.getOcorrencias()
      .then((res) => {
        if (res && res.items && res.items.length > 0) {
          const mapped: OccurrenceItem[] = res.items.map((occ, idx) => ({
            id: occ.id || `api-occ-${idx}`,
            code: `#EPI-API-${idx + 1}`,
            title: `Foco #${idx + 1} (${occ.agente_identificado})`,
            badge: `${occ.severidade} • ${occ.agente_identificado.toUpperCase()}`,
            badgeClass: occ.severidade === 'CRITICA' ? 'badge-danger' : occ.severidade === 'ALTA' ? 'badge-warn' : 'badge-info',
            date: 'Hoje',
            timestamp: occ.observado_em ? new Date(occ.observado_em).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR'),
            agent: occ.agente_identificado,
            agentScientific: occ.agente_identificado,
            category: occ.agente_identificado.toLowerCase().includes('ferrugem') ? 'FERRUGEM' : 'LAGARTA',
            talhao: 'Talhão Georreferenciado',
            talhaoShort: 'T-GEO',
            crop: 'Cultura Registrada',
            gps: `${occ.latitude.toFixed(4)}°, ${occ.longitude.toFixed(4)}°`,
            severity: `${occ.severidade}`,
            severityLevel: (occ.severidade === 'CRITICA' || occ.severidade === 'ALTA' || occ.severidade === 'MEDIA' || occ.severidade === 'BAIXA') ? occ.severidade as any : 'MEDIA',
            prescription: occ.observacoes || 'Monitoramento recomendado.',
            productName: 'Defensivo Compatível',
            stockAvailable: 'Em verificação',
            status: 'EM ABERTO',
            img: occ.foto_url || 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
            boxLabel: occ.agente_identificado,
            confidence: 95.0,
          }));
          setOccurrences((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const fresh = mapped.filter((m) => !existingIds.has(m.id));
            return [...fresh, ...prev];
          });
        }
      })
      .catch((err) => {
        console.info('Modo demonstração ativo em Vigilância Sanitária:', err);
      });
  }, []);
  
  // Filtros de mapa e tabela
  const [mapAgentFilter, setMapAgentFilter] = useState<string>('ALL');
  const [mapLayerFilter, setMapLayerFilter] = useState<'HEATMAP' | 'PINS' | 'PARCELAS'>('HEATMAP');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [tableSeverityFilter, setTableSeverityFilter] = useState<string>('ALL');
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('ALL');
  
  // Simulador Spore-Cast Microclimático
  const [simTemp, setSimTemp] = useState<number>(23.4);
  const [simHumidity, setSimHumidity] = useState<number>(88);
  const [simWetness, setSimWetness] = useState<number>(14.0);
  const [windAngle, setWindAngle] = useState<number>(135); // SE
  
  // Modais e feedbacks
  const [modalNewOccurOpen, setModalNewOccurOpen] = useState<boolean>(false);
  const [modalSprayOpen, setModalSprayOpen] = useState<boolean>(false);
  const [modalPhotoOpen, setModalPhotoOpen] = useState<boolean>(false);
  const [sprayForm, setSprayForm] = useState({
    talhao: 'Talhão 02',
    agente: 'Ferrugem Asiática',
    produto: 'Azoxistrobina + Ciproconazol',
    maquina: 'PV-01',
    dose: '0,30 L/ha + 0,5% Óleo',
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const selectedOccurrence =
    occurrences.find((o) => o.id === selectedOccurrenceId) || occurrences[0];

  // Cálculo reativo do modelo Spore-Cast
  const calculatedPests = useMemo(() => {
    // 1. Ferrugem Asiática (Ótimo: 20-25°C, UR >= 85%, Molhamento >= 10h)
    const sTempFerrugem =
      simTemp >= 20 && simTemp <= 25 ? 1.0 : Math.max(0, 1.0 - Math.abs(22.5 - simTemp) / 8);
    const sHumFerrugem = simHumidity >= 85 ? 1.0 : simHumidity / 85;
    const sWetFerrugem = Math.min(1.0, simWetness / 12.0);
    const scoreFerrugem = Math.min(1.0, Math.max(0, sTempFerrugem * 0.35 + sHumFerrugem * 0.35 + sWetFerrugem * 0.30));

    // 2. Lagarta-do-cartucho (Ótimo: 25-30°C, UR 60%)
    const sTempLagarta =
      simTemp >= 25 && simTemp <= 30 ? 1.0 : Math.max(0, 1.0 - Math.abs(27.5 - simTemp) / 10);
    const sHumLagarta = Math.max(0, 1.0 - Math.abs(60 - simHumidity) / 40);
    const scoreLagarta = Math.min(1.0, Math.max(0, sTempLagarta * 0.6 + sHumLagarta * 0.4));

    // 3. Cigarrinha do Milho (Ótimo: 27-32°C, UR 50%)
    const sTempCigarrinha =
      simTemp >= 27 && simTemp <= 32 ? 1.0 : Math.max(0, 1.0 - Math.abs(29.5 - simTemp) / 10);
    const scoreCigarrinha = Math.min(1.0, Math.max(0, sTempCigarrinha * 0.7));

    // 4. Mosca Branca (Ótimo: 28-33°C, UR seca)
    const sTempMosca =
      simTemp >= 28 && simTemp <= 33 ? 1.0 : Math.max(0, 1.0 - Math.abs(30.5 - simTemp) / 10);
    const scoreMosca = Math.min(1.0, Math.max(0, sTempMosca * 0.5));

    // 5. Antracnose (Ótimo: 22-28°C, UR >= 80%)
    const sTempAntracnose =
      simTemp >= 22 && simTemp <= 28 ? 1.0 : Math.max(0, 1.0 - Math.abs(25 - simTemp) / 8);
    const sHumAntracnose = simHumidity >= 80 ? 1.0 : simHumidity / 80;
    const scoreAntracnose = Math.min(1.0, Math.max(0, sTempAntracnose * 0.5 + sHumAntracnose * 0.5));

    const overallScore = (
      scoreFerrugem * 0.4 +
      scoreLagarta * 0.2 +
      scoreAntracnose * 0.2 +
      scoreCigarrinha * 0.1 +
      scoreMosca * 0.1
    ).toFixed(2);

    return {
      ferrugem: scoreFerrugem,
      lagarta: scoreLagarta,
      cigarrinha: scoreCigarrinha,
      mosca: scoreMosca,
      antracnose: scoreAntracnose,
      overall: overallScore,
    };
  }, [simTemp, simHumidity, simWetness]);

  // Filtragem da tabela
  const filteredOccurrences = occurrences.filter((item) => {
    const q = tableSearch.toLowerCase();
    const matchesSearch =
      item.code.toLowerCase().includes(q) ||
      item.agent.toLowerCase().includes(q) ||
      item.talhao.toLowerCase().includes(q) ||
      item.crop.toLowerCase().includes(q);

    const matchesSeverity =
      tableSeverityFilter === 'ALL' || item.severityLevel === tableSeverityFilter;
    const matchesStatus =
      tableStatusFilter === 'ALL' || item.status === tableStatusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Funções de ação
  const handleOpenSprayModal = (occ: OccurrenceItem) => {
    setSprayForm({
      talhao: occ.talhao,
      agente: occ.agent,
      produto: occ.productName,
      maquina: 'PV-01',
      dose: '0,30 L/ha + 0,5% Óleo',
    });
    setModalSprayOpen(true);
  };

  const handleCreateSprayOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`OS de Pulverização transmitida via ISOBUS / CAN Bus ao maquinário ${sprayForm.maquina}!`);
    setModalSprayOpen(false);
  };

  const handleSporeSimulation = () => {
    setWindAngle((prev) => (prev === 135 ? 180 : 135));
    showToast('Simulação Spore-Cast atualizada: dispersão de esporos recalculada conforme rosa dos ventos!');
  };

  const handleResetSimulator = () => {
    setSimTemp(23.4);
    setSimHumidity(88);
    setSimWetness(14.0);
    showToast('Parâmetros restaurados com telemetria direta da estação INMET da fazenda.');
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportReport = async () => {
    try {
      setIsExportingPdf(true);
      showToast('Compilando laudo técnico fitossanitário em PDF oficial com assinatura CREA...');
      await epidemiologicoService.exportarLaudoPdf();
      showToast('Laudo fitossanitário emitido e baixado com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao gerar laudo em PDF. Verifique a conexão com a API.');
    } finally {
      setIsExportingPdf(false);
    }
  };


  // Estados do Modal 1: Registro de Ocorrência Fitossanitária em Campo
  const [occurTalhao, setOccurTalhao] = useState('Talhão 02 • Pivô Central');
  const [occurAgente, setOccurAgente] = useState('Ferrugem Asiática (Phakopsora pachyrhizi)');
  const [occurSeveridade, setOccurSeveridade] = useState<'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA'>('ALTA');
  const [occurLat, setOccurLat] = useState('-12.5020');
  const [occurLon, setOccurLon] = useState('-55.7015');
  const [occurObs, setOccurObs] = useState('Presença de uredósporos maduros na face abaxial em estágio R3.');
  const [occurPhotoLoaded, setOccurPhotoLoaded] = useState(false);

  const handleSimulatePhotoUpload = () => {
    setOccurPhotoLoaded(true);
    showToast('Foto da amostra carregada com metadados EXIF e GPS validados!');
  };

  const handleCreateNewOccurrenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `EPI-${Math.floor(100 + Math.random() * 900)}`;
    const shortTalhao = occurTalhao.split(' ')[0] || 'T-02';
    const agentSimple = occurAgente.split(' (')[0];
    const category: OccurrenceItem['category'] = occurAgente.includes('Ferrugem')
      ? 'FERRUGEM'
      : occurAgente.includes('Lagarta')
      ? 'LAGARTA'
      : occurAgente.includes('Percevejo')
      ? 'PERCEVEJO'
      : occurAgente.includes('Antracnose')
      ? 'ANTRACNOSE'
      : 'CIGARRINHA';

    const newRecord: OccurrenceItem = {
      id: newId,
      code: `#${newId}`,
      title: `Foco #${newId} (${shortTalhao})`,
      badge: `${occurSeveridade} • ${agentSimple.toUpperCase()}`,
      badgeClass:
        occurSeveridade === 'CRITICA'
          ? 'badge-danger'
          : occurSeveridade === 'ALTA'
          ? 'badge-warn'
          : occurSeveridade === 'MEDIA'
          ? 'badge-info'
          : 'badge-accent',
      date: 'Hoje, agora',
      timestamp: new Date().toLocaleString('pt-BR'),
      agent: agentSimple,
      agentScientific: occurAgente,
      category,
      talhao: occurTalhao,
      talhaoShort: shortTalhao,
      crop: 'Soja Intacta (180 ha)',
      gps: `${occurLat}°, ${occurLon}°`,
      severity:
        occurSeveridade === 'CRITICA'
          ? '>20% Sev. Foliar'
          : occurSeveridade === 'ALTA'
          ? '12% Inc. • 8% Sev.'
          : occurSeveridade === 'MEDIA'
          ? '5-10% Incidência'
          : '<5% Monitorado',
      severityLevel: occurSeveridade,
      prescription: `Aplicação curativa recomendada para contenção de ${agentSimple}.`,
      productName: 'Azoxistrobina + Ciproconazol',
      stockAvailable: 'Estoque disponível no Galpão 01',
      status: 'EM ABERTO',
      img: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
      boxLabel: agentSimple,
      confidence: 97.8,
    };

    setOccurrences((prev) => [newRecord, ...prev]);
    setSelectedOccurrenceId(newId);
    showToast(`Ocorrência fitossanitária #${newId} cadastrada com sucesso e plotada no mapa!`);
    setModalNewOccurOpen(false);

    // Sincronizar com FastAPI e fila offline
    queueOperation(
      'ocorrencia_sanitaria',
      'CREATE',
      newId,
      {
        tipo_cultura: 'Soja',
        agente_identificado: agentSimple,
        severidade: occurSeveridade,
        latitude: parseFloat(occurLat) || -12.502,
        longitude: parseFloat(occurLon) || -55.7015,
        observado_em: new Date().toISOString(),
      },
      'LWW'
    ).catch(() => {});

    epidemiologicoService.createOcorrencia({
      tipo_ameaca: 'DOENCA',
      agente_identificado: agentSimple,
      severidade: occurSeveridade,
      latitude: parseFloat(occurLat) || -12.502,
      longitude: parseFloat(occurLon) || -55.7015,
      observado_em: new Date().toISOString(),
      observacoes: occurObs,
      notificar_orgao_defesa: occurSeveridade === 'CRITICA',
    }).catch((err) => {
      console.info('Ocorrência registrada localmente em modo offline:', err);
    });
  };

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

      {/* Cabeçalho da Página */}
      <div className="page-header stagger-item">
        <div className="page-header-left">
          <h1 className="page-heading">Vigilância Sanitária & Monitoramento Epidemiológico</h1>
          <p className="page-subheading">
            Rastreamento georreferenciado de pragas e patógenos fúngicos com previsão de esporulação microclimática
          </p>
        </div>
        <div className="header-actions">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            <span>Safra Ativa:</span>
            <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              2024/25 (Soja & Milho)
            </strong>
          </div>
          <button className="btn btn-outline" onClick={handleExportReport} disabled={isExportingPdf}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {isExportingPdf ? 'Gerando Laudo...' : 'Exportar Laudo'}
          </button>
          <button className="btn btn-primary" onClick={() => setModalNewOccurOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo Registro Sanitário
          </button>
        </div>
      </div>

      {/* Banner de Alerta Crítico Proativo do Motor de Alertas */}
      <section className="critical-alert-banner stagger-item">
        <div className="alert-banner-left">
          <div className="alert-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div className="alert-content">
            <div className="alert-badge-row">
              <span className="badge-alert-type">SURTO FITOSSANITÁRIO DETECTADO</span>
              <span className="badge-alert-code">ALERTA #EPI-2026-04 • TALHÃO 02</span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span style={{ fontSize: '11px', color: 'var(--danger-text)', fontFamily: 'var(--font-mono)' }}>
                Score de Risco: 0.82 (Crítico)
              </span>
            </div>
            <div className="alert-headline">
              Ferrugem Asiática (Phakopsora pachyrhizi) em fase de esporulação ativa no Talhão 02 (180 ha)
            </div>
            <div className="alert-description">
              Microclima altamente favorável: <strong>88% de umidade relativa</strong> e <strong>14h contínuas de molhamento foliar</strong>. Vento de Sudeste (14 km/h) com risco iminente de dispersão de uredósporos para o Talhão 03 nas próximas 36 horas. Recomendada aplicação curativa imediata.
            </div>
          </div>
        </div>
        <div className="alert-banner-actions">
          <button
            className="btn btn-danger-outline"
            onClick={() => handleOpenSprayModal(occurrences[0])}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
            </svg>
            Gerar OS de Pulverização
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              setSelectedOccurrenceId('EPI-104');
              showToast('Talhão 02 focalizado no mapa georreferenciado!');
            }}
          >
            Localizar no Mapa
          </button>
        </div>
      </section>

      {/* KPIs Executivos Sanitários Padronizados */}
      <section className="warehouses-grid stagger-item" style={{ animationDelay: '100ms' }}>
        {/* KPI 1: Score Geral */}
        <div className="warehouse-card">
          <div className="wh-header">
            <div className="wh-icon-box red">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <span className="wh-status-badge danger">Risco Alto</span>
          </div>
          <div className="wh-info">
            <span className="wh-title">Pressão Sanitária Geral</span>
            <span className="wh-type">Clima (60%): 0.58 • Histórico (40%): 0.44</span>
          </div>
          <div className="wh-gauge-wrap">
            <div className="wh-gauge-header">
              <span>Índice Preditivo</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {calculatedPests.overall} / 1.00 ({Math.round(parseFloat(calculatedPests.overall) * 100)}%)
              </span>
            </div>
            <div className="wh-progress-bg">
              <div
                className="wh-progress-fill red"
                style={{ width: `${Math.min(100, Math.max(5, Math.round(parseFloat(calculatedPests.overall) * 100)))}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Ocorrências na Região */}
        <div className="warehouse-card">
          <div className="wh-header">
            <div className="wh-icon-box amber">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <span className="wh-status-badge high">7 Focos Ativos</span>
          </div>
          <div className="wh-info">
            <span className="wh-title">Ocorrências na Região (50km)</span>
            <span className="wh-type">{occurrences.length} na fazenda • 2 críticas • 3 altas</span>
          </div>
          <div className="wh-gauge-wrap">
            <div className="wh-gauge-header">
              <span>Severidade Regional</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>7 focos ativos</span>
            </div>
            <div className="wh-progress-bg">
              <div className="wh-progress-fill amber" style={{ width: '70%' }} />
            </div>
          </div>
        </div>

        {/* KPI 3: Microclima e Molhamento Foliar */}
        <div className="warehouse-card">
          <div className="wh-header">
            <div className="wh-icon-box blue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c0 0-6.75 7.765-6.75 12a6.75 6.75 0 0 0 13.5 0c0-4.235-6.75-12-6.75-12Z" />
              </svg>
            </div>
            <span className="wh-status-badge danger">Gatilho Ativo</span>
          </div>
          <div className="wh-info">
            <span className="wh-title">Molhamento Foliar Contínuo</span>
            <span className="wh-type">Temp Média: {simTemp.toFixed(1)} °C • UR: {simHumidity}%</span>
          </div>
          <div className="wh-gauge-wrap">
            <div className="wh-gauge-header">
              <span>Janela de Infecção</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{simWetness.toFixed(1)} horas</span>
            </div>
            <div className="wh-progress-bg">
              <div
                className="wh-progress-fill blue"
                style={{ width: `${Math.min(100, Math.round((simWetness / 24) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4: Área em Manejo Fitossanitário */}
        <div className="warehouse-card">
          <div className="wh-header">
            <div className="wh-icon-box emerald">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <span className="wh-status-badge ok">72% Protegido</span>
          </div>
          <div className="wh-info">
            <span className="wh-title">Área em Manejo Fitossanitário</span>
            <span className="wh-type">Talhão 02 (120ha) • Talhão 03 (60ha)</span>
          </div>
          <div className="wh-gauge-wrap">
            <div className="wh-gauge-header">
              <span>Área Quarentenada</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>180 ha (72%)</span>
            </div>
            <div className="wh-progress-bg">
              <div className="wh-progress-fill" style={{ width: '72%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Seção Central: Mapa Georreferenciado + Painel de Foco */}
      <section className="map-and-focus-grid stagger-item">
        {/* Mapa Vetorial Interativo */}
        <div className="map-card">
          <div className="map-header">
            <div className="map-title-row">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '17px', height: '17px', color: 'var(--accent)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
              </svg>
              <span className="map-title">Mosaico GIS & Heatmap de Dispersão Espacial</span>
              <span className="kpi-badge badge-info" style={{ fontSize: '10px' }}>EPSG:4326 • SIRGAS 2000</span>
            </div>
            <div className="map-filters-row">
              <div style={{ width: 220 }}>
                <CustomSelect
                  value={mapAgentFilter}
                  onChange={(val) => setMapAgentFilter(val)}
                  options={[
                    { value: 'ALL', label: 'Todos os Patógenos' },
                    { value: 'FERRUGEM', label: 'Ferrugem Asiática (Fungos)' },
                    { value: 'LAGARTA', label: 'Lagarta-do-cartucho (Insetos)' },
                    { value: 'PERCEVEJO', label: 'Percevejo-marrom (Insetos)' },
                  ]}
                />
              </div>

              <div style={{ width: 210 }}>
                <CustomSelect
                  value={mapLayerFilter}
                  onChange={(val) => setMapLayerFilter(val as 'HEATMAP' | 'PINS' | 'PARCELAS')}
                  options={[
                    { value: 'HEATMAP', label: 'Heatmap + Focos Ativos' },
                    { value: 'PINS', label: 'Apenas Focos e Pins' },
                    { value: 'PARCELAS', label: 'Limites de Talhões' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Viewport do Mapa */}
          <div className="map-viewport">
            <div className="grid-overlay"></div>
            <div className="coords-tl">LAT: -12.5000° S | LON: -55.7000° O • FAZENDA SANTA MARIA</div>
            <div className="coords-br">RESOLUÇÃO: 10m/px • RADAR SPOT-7</div>

            {/* Widget Rosa dos Ventos */}
            <div className="wind-widget" onClick={handleSporeSimulation} style={{ cursor: 'pointer' }} title="Clique para simular dispersão pelo vento">
              <div className="wind-arrow" style={{ transform: `rotate(${windAngle}deg)` }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>VENTO SE • 14 km/h</div>
                <div style={{ fontSize: '10px', color: 'var(--danger-text)' }}>Dispersão ativa p/ Noroeste</div>
              </div>
            </div>

            {/* Legenda de Calor */}
            <div className="map-legend">
              <span className="legend-title">Densidade de Inóculo / Calor</span>
              <div className="legend-bar"></div>
              <div className="legend-labels">
                <span>0.0 (Baixo)</span>
                <span>0.5 (Médio)</span>
                <span>1.0 (Crítico)</span>
              </div>
            </div>

            {/* SVG do Mapa Georreferenciado */}
            <svg className="map-svg" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="heatGlowT02" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.80" />
                  <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="heatGlowT05" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.65" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Estradas de serviço e carreadores internos */}
              <path
                d="M 30 218 L 770 218 M 265 90 L 265 218 M 515 90 L 515 218 M 390 218 L 390 350"
                stroke="#27272a"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                fill="none"
              />

              {/* Camada de Calor (Heatmap) */}
              {mapLayerFilter === 'HEATMAP' && (
                <g style={{ opacity: mapAgentFilter === 'ALL' || mapAgentFilter === 'FERRUGEM' ? 1 : 0.2 }}>
                  <circle cx="390" cy="148" r="105" fill="url(#heatGlowT02)" className="heatmap-radial" />
                  <circle cx="575" cy="289" r="95" fill="url(#heatGlowT05)" className="heatmap-radial" />
                </g>
              )}

              {/* Polígonos Cadastrais dos Talhões */}
              {/* Talhão 01: Soja */}
              <rect
                x="45"
                y="92"
                width="210"
                height="112"
                rx="6"
                ry="6"
                className="talhao-poly"
                fill="#10b981"
                fillOpacity="0.14"
                stroke="#10b981"
                strokeWidth="1.5"
                onClick={() => setSelectedOccurrenceId('EPI-102')}
              />
              <text x="150" y="128" textAnchor="middle" fill="#e4e4e7" fontFamily="'JetBrains Mono', monospace" fontSize="13" fontWeight="700">T-01</text>
              <text x="150" y="146" textAnchor="middle" fill="#a1a1aa" fontSize="11">140 ha • Soja</text>
              <text x="150" y="166" textAnchor="middle" fill="#10b981" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">✓ NORMAL</text>

              {/* Talhão 02: Soja (FOCO CRÍTICO) */}
              <rect
                x="275"
                y="92"
                width="230"
                height="112"
                rx="6"
                ry="6"
                className="talhao-poly infected"
                fill="#ef4444"
                fillOpacity="0.25"
                stroke="#ef4444"
                strokeWidth={selectedOccurrenceId === 'EPI-104' ? 3 : 2}
                onClick={() => setSelectedOccurrenceId('EPI-104')}
              />
              <text x="390" y="122" textAnchor="middle" fill="#fca5a5" fontFamily="'JetBrains Mono', monospace" fontSize="13" fontWeight="700">T-02 [FOCO CRÍTICO]</text>
              <text x="390" y="140" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="600">180 ha • Ferrugem Asiática</text>

              {/* Talhão 03: Soja (Área de Risco de Vento) */}
              <rect
                x="525"
                y="92"
                width="225"
                height="112"
                rx="6"
                ry="6"
                className="talhao-poly at-risk"
                fill="#f59e0b"
                fillOpacity="0.16"
                stroke="#f59e0b"
                strokeWidth={selectedOccurrenceId === 'EPI-105' ? 3 : 1.8}
                strokeDasharray="5 3"
                onClick={() => setSelectedOccurrenceId('EPI-105')}
              />
              <text x="637" y="122" textAnchor="middle" fill="#fde68a" fontFamily="'JetBrains Mono', monospace" fontSize="13" fontWeight="700">T-03 [ALERTA]</text>
              <text x="637" y="140" textAnchor="middle" fill="#fbbf24" fontSize="11">120 ha • Risco Dispersão</text>

              {/* Talhão 04: Milho Híbrido */}
              <rect
                x="45"
                y="232"
                width="340"
                height="115"
                rx="6"
                ry="6"
                className="talhao-poly"
                fill="#10b981"
                fillOpacity="0.12"
                stroke="#10b981"
                strokeWidth="1.5"
                onClick={() => setSelectedOccurrenceId('EPI-102')}
              />
              <text x="215" y="268" textAnchor="middle" fill="#e4e4e7" fontFamily="'JetBrains Mono', monospace" fontSize="13" fontWeight="700">T-04</text>
              <text x="215" y="286" textAnchor="middle" fill="#a1a1aa" fontSize="11">160 ha • Milho Híbrido</text>
              <text x="215" y="304" textAnchor="middle" fill="#10b981" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">✓ Biológico Controlado</text>

              {/* Talhão 05: Milho (Percevejo-marrom) */}
              <rect
                x="405"
                y="232"
                width="345"
                height="115"
                rx="6"
                ry="6"
                className="talhao-poly"
                fill="#3b82f6"
                fillOpacity="0.16"
                stroke="#3b82f6"
                strokeWidth={selectedOccurrenceId === 'EPI-103' ? 3 : 1.8}
                onClick={() => setSelectedOccurrenceId('EPI-103')}
              />
              <text x="577" y="268" textAnchor="middle" fill="#93c5fd" fontFamily="'JetBrains Mono', monospace" fontSize="13" fontWeight="700">T-05 [PERCEVEJO-MARROM]</text>
              <text x="577" y="286" textAnchor="middle" fill="#60a5fa" fontSize="11">210 ha • Milho Alto • Monitorado</text>

              {/* Pins Georreferenciados */}
              {mapLayerFilter !== 'PARCELAS' && (
                <>
                  {/* Pin 1: Foco Crítico T-02 */}
                  <g className="map-pin" transform="translate(390, 168)" onClick={() => setSelectedOccurrenceId('EPI-104')}>
                    <title>Foco #EPI-104 • Ferrugem Asiática (98.4%)</title>
                    <circle cx="0" cy="0" r="20" fill="transparent" className="pin-hitbox" />
                    <circle cx="0" cy="0" r="14" fill="rgba(239, 68, 68, 0.35)" className="pin-pulse" />
                    <circle cx="0" cy="0" r="7.5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="pin-core" />
                    <path d="M -4 -4 L 4 4 M -4 4 L 4 -4" stroke="#ffffff" strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
                  </g>

                  {/* Pin 2: Ponto T-03 (Alerta Preventivo) */}
                  <g className="map-pin" transform="translate(637, 168)" onClick={() => setSelectedOccurrenceId('EPI-105')}>
                    <title>Foco #EPI-105 • Risco Dispersão</title>
                    <circle cx="0" cy="0" r="20" fill="transparent" className="pin-hitbox" />
                    <circle cx="0" cy="0" r="12" fill="rgba(245, 158, 11, 0.3)" className="pin-pulse" />
                    <circle cx="0" cy="0" r="6.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.8" className="pin-core" />
                  </g>

                  {/* Pin 3: Ponto T-05 (Percevejo) */}
                  <g className="map-pin" transform="translate(577, 318)" onClick={() => setSelectedOccurrenceId('EPI-103')}>
                    <title>Foco #EPI-103 • Percevejo-marrom</title>
                    <circle cx="0" cy="0" r="20" fill="transparent" className="pin-hitbox" />
                    <circle cx="0" cy="0" r="12" fill="rgba(59, 130, 246, 0.3)" className="pin-pulse" />
                    <circle cx="0" cy="0" r="6.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.8" className="pin-core" />
                  </g>

                  {/* Pin 4: Ponto T-04 (Lagarta Controlada) */}
                  <g className="map-pin" transform="translate(215, 320)" onClick={() => setSelectedOccurrenceId('EPI-102')}>
                    <title>Foco #EPI-102 • Lagarta-do-cartucho (Controlado)</title>
                    <circle cx="0" cy="0" r="20" fill="transparent" className="pin-hitbox" />
                    <circle cx="0" cy="0" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" className="pin-core" />
                  </g>
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Painel Lateral de Inspeção & Evidência com IA */}
        <div className="focus-card">
          <div className="focus-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`focus-badge ${selectedOccurrence.badgeClass}`}>
                {selectedOccurrence.badge}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedOccurrence.title}
              </span>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {selectedOccurrence.date}
            </span>
          </div>

          <div className="focus-body">
            {/* Foto da Lesão com Visão Computacional */}
            <div className="evidence-photo-container">
              <img src={selectedOccurrence.img} alt="Evidência Fotográfica" className="evidence-img" />
              <div className="ai-bounding-box">
                <span className="ai-label-tag">{selectedOccurrence.boxLabel}</span>
              </div>
              <div className="ai-confidence-pill">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '12px', height: '12px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>IA Confiança: <strong>{selectedOccurrence.confidence}%</strong></span>
              </div>
              <button
                className="btn-enlarge-photo"
                title="Ampliar Foto da Coleta"
                onClick={() => setModalPhotoOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              </button>
            </div>

            {/* Detalhes Técnicos */}
            <div className="focus-details-grid">
              <div className="detail-item">
                <span className="detail-label">Agente Patogênico</span>
                <span className="detail-value" style={{ color: selectedOccurrence.severityLevel === 'CRITICA' ? 'var(--danger-text)' : undefined }}>
                  {selectedOccurrence.agentScientific}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Talhão / Cultura</span>
                <span className="detail-value">{selectedOccurrence.talhaoShort} • {selectedOccurrence.crop}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Coordenadas GPS</span>
                <span className="detail-value">{selectedOccurrence.gps}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Incidência / Severidade</span>
                <span className="detail-value">{selectedOccurrence.severity}</span>
              </div>
            </div>

            {/* Prescrição Agronômica Sugerida */}
            <div className="prescription-box">
              <div className="prescription-title">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Prescrição Agronômica Sugerida
              </div>
              <div className="prescription-text">{selectedOccurrence.prescription}</div>
              <div className="prescription-stock">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '13px', height: '13px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
                <span>{selectedOccurrence.stockAvailable}</span>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="focus-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleOpenSprayModal(selectedOccurrence)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
                </svg>
                Emitir Ordem de Aplicação Imediata
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  className="btn btn-outline"
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                  onClick={() => showToast('Coordenadas compartilhadas com a cooperativa e defesa agropecuária.')}
                >
                  Notificar Defesa MAPA
                </button>
                <button
                  className="btn btn-outline"
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                  onClick={() => setModalPhotoOpen(true)}
                >
                  Ver Laudo Completo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simulador Preditivo de Risco Microclimático (Spore-Cast) */}
      <section className="simulator-card stagger-item">
        <div className="simulator-header">
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Motor Preditivo Microclimático (Spore-Cast)
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Simulação do índice de risco em tempo real cruzando histórico e parâmetros meteorológicos (Estação INMET)
            </p>
          </div>
          <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={handleResetSimulator}>
            Restaurar Valores da Estação
          </button>
        </div>

        {/* Sliders Interativos */}
        <div className="sim-controls-grid">
          {/* Slider 1: Temperatura */}
          <div className="sim-slider-group">
            <div className="slider-top-row">
              <span className="slider-label">Temperatura Média do Ar</span>
              <span className="slider-val-badge">{simTemp.toFixed(1)} °C</span>
            </div>
            <input
              type="range"
              min="15"
              max="38"
              step="0.5"
              value={simTemp}
              onChange={(e) => setSimTemp(parseFloat(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>15 °C</span>
              <span>Ótimo p/ Ferrugem: 20-25°C</span>
              <span>38 °C</span>
            </div>
          </div>

          {/* Slider 2: Umidade Relativa */}
          <div className="sim-slider-group">
            <div className="slider-top-row">
              <span className="slider-label">Umidade Relativa (UR)</span>
              <span className="slider-val-badge">{simHumidity} %</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="1"
              value={simHumidity}
              onChange={(e) => setSimHumidity(parseInt(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>30%</span>
              <span>Gatilho Crítico: &gt;85%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Slider 3: Molhamento Foliar */}
          <div className="sim-slider-group">
            <div className="slider-top-row">
              <span className="slider-label">Horas de Molhamento Foliar</span>
              <span className="slider-val-badge">{simWetness.toFixed(1)} h</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="0.5"
              value={simWetness}
              onChange={(e) => setSimWetness(parseFloat(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>0 h</span>
              <span>Esporulação &gt;10h</span>
              <span>24 h</span>
            </div>
          </div>
        </div>

        {/* Riscos Calculados por Praga/Doença */}
        <div className="pest-risk-grid">
          {/* 1. Ferrugem */}
          <div className="pest-risk-card">
            <span className="pest-name" style={{ color: 'var(--danger-text)' }}>Ferrugem Asiática</span>
            <span className="pest-scientific">P. pachyrhizi (Soja)</span>
            <div className="pest-score-row">
              <span className="pest-score-val" style={{ color: calculatedPests.ferrugem >= 0.7 ? 'var(--danger-text)' : 'var(--warning-text)' }}>
                {calculatedPests.ferrugem.toFixed(2)}
              </span>
              <span className={`focus-badge ${calculatedPests.ferrugem >= 0.7 ? 'badge-danger' : 'badge-warn'}`}>
                {calculatedPests.ferrugem >= 0.7 ? 'CRÍTICO' : 'ALTO'}
              </span>
            </div>
            <div className="pest-risk-bar">
              <div
                className="pest-risk-bar-fill"
                style={{
                  width: `${Math.round(calculatedPests.ferrugem * 100)}%`,
                  background: calculatedPests.ferrugem >= 0.7 ? 'var(--danger)' : 'var(--warning)',
                }}
              ></div>
            </div>
          </div>

          {/* 2. Lagarta */}
          <div className="pest-risk-card">
            <span className="pest-name">Lagarta-do-cartucho</span>
            <span className="pest-scientific">S. frugiperda (Milho)</span>
            <div className="pest-score-row">
              <span className="pest-score-val" style={{ color: 'var(--warning-text)' }}>
                {calculatedPests.lagarta.toFixed(2)}
              </span>
              <span className="focus-badge badge-warn">MÉDIO</span>
            </div>
            <div className="pest-risk-bar">
              <div
                className="pest-risk-bar-fill"
                style={{ width: `${Math.round(calculatedPests.lagarta * 100)}%`, background: 'var(--warning)' }}
              ></div>
            </div>
          </div>

          {/* 3. Cigarrinha */}
          <div className="pest-risk-card">
            <span className="pest-name">Cigarrinha do Milho</span>
            <span className="pest-scientific">D. maidis (Enfezamento)</span>
            <div className="pest-score-row">
              <span className="pest-score-val" style={{ color: 'var(--info-text)' }}>
                {calculatedPests.cigarrinha.toFixed(2)}
              </span>
              <span className="focus-badge badge-info">MODERADO</span>
            </div>
            <div className="pest-risk-bar">
              <div
                className="pest-risk-bar-fill"
                style={{ width: `${Math.round(calculatedPests.cigarrinha * 100)}%`, background: 'var(--info)' }}
              ></div>
            </div>
          </div>

          {/* 4. Mosca Branca */}
          <div className="pest-risk-card">
            <span className="pest-name">Mosca Branca</span>
            <span className="pest-scientific">Bemisia tabaci (Geral)</span>
            <div className="pest-score-row">
              <span className="pest-score-val" style={{ color: 'var(--accent-text)' }}>
                {calculatedPests.mosca.toFixed(2)}
              </span>
              <span className="focus-badge badge-accent">BAIXO</span>
            </div>
            <div className="pest-risk-bar">
              <div
                className="pest-risk-bar-fill"
                style={{ width: `${Math.round(calculatedPests.mosca * 100)}%`, background: 'var(--accent)' }}
              ></div>
            </div>
          </div>

          {/* 5. Antracnose */}
          <div className="pest-risk-card">
            <span className="pest-name">Antracnose</span>
            <span className="pest-scientific">C. truncatum (Soja)</span>
            <div className="pest-score-row">
              <span className="pest-score-val" style={{ color: 'var(--warning-text)' }}>
                {calculatedPests.antracnose.toFixed(2)}
              </span>
              <span className="focus-badge badge-warn">ALTO</span>
            </div>
            <div className="pest-risk-bar">
              <div
                className="pest-risk-bar-fill"
                style={{ width: `${Math.round(calculatedPests.antracnose * 100)}%`, background: 'var(--warning)' }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabela Técnica de Ocorrências Sanitárias */}
      <section className="table-card stagger-item">
        <div className="table-toolbar">
          <div className="table-search-box">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              style={{ width: 15, height: 15, flexShrink: 0 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Filtrar por agente, talhão ou cultura..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
          </div>

          <div className="table-filters-group">
            <div style={{ width: 190 }}>
              <CustomSelect
                value={tableSeverityFilter}
                onChange={(val) => setTableSeverityFilter(val)}
                options={[
                  { value: 'ALL', label: 'Todas as Severidades' },
                  { value: 'CRITICA', label: 'Crítica', badge: { text: 'CRÍTICA', className: 'badge-danger' } },
                  { value: 'ALTA', label: 'Alta', badge: { text: 'ALTA', className: 'badge-warn' } },
                  { value: 'MEDIA', label: 'Média', badge: { text: 'MÉDIA', className: 'badge-info' } },
                  { value: 'BAIXA', label: 'Baixa', badge: { text: 'BAIXA', className: 'badge-accent' } },
                ]}
              />
            </div>

            <div style={{ width: 170 }}>
              <CustomSelect
                value={tableStatusFilter}
                onChange={(val) => setTableStatusFilter(val)}
                options={[
                  { value: 'ALL', label: 'Todos os Status' },
                  { value: 'EM ABERTO', label: 'Em Aberto' },
                  { value: 'EM TRATAMENTO', label: 'Em Tratamento' },
                  { value: 'MONITORADO', label: 'Monitorado' },
                  { value: 'CONTROLADO', label: 'Controlado' },
                ]}
              />
            </div>

            <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={handleExportReport}>
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Laudo</th>
                <th>Data / Hora</th>
                <th>Talhão</th>
                <th>Cultura</th>
                <th>Agente Identificado</th>
                <th>Severidade</th>
                <th>Evidência</th>
                <th>Status Manejo</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOccurrences.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedOccurrenceId(row.id)}
                  style={{
                    cursor: 'pointer',
                    background: row.id === selectedOccurrenceId ? 'rgba(255, 255, 255, 0.03)' : undefined,
                  }}
                >
                  <td className="cell-mono" style={{ color: row.severityLevel === 'CRITICA' ? 'var(--danger-text)' : undefined }}>
                    {row.code}
                  </td>
                  <td>{row.timestamp}</td>
                  <td><strong>{row.talhao}</strong></td>
                  <td>{row.crop.split(' ')[0]}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.agent}</span>
                    <div style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                      {row.agentScientific.split('(')[0]}
                    </div>
                  </td>
                  <td>
                    <span className={`badge-sev badge-sev-${row.severityLevel.toLowerCase()}`}>
                      {row.severityLevel}
                    </span>
                  </td>
                  <td>
                    <img
                      src={row.img}
                      alt="Laudo"
                      className="thumb-cell"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOccurrenceId(row.id);
                        setModalPhotoOpen(true);
                      }}
                    />
                  </td>
                  <td>
                    <span className={`focus-badge ${row.badgeClass}`}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSprayModal(row);
                      }}
                    >
                      Gerar OS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px', background: 'rgba(17, 18, 21, 0.4)' }}>
          <span>Mostrando {filteredOccurrences.length} de {occurrences.length} ocorrências fitossanitárias sincronizadas</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>Sincronização offline ativa • PostGIS / SQLite v2.1</span>
        </div>
      </section>

      {/* MODAL 1: REGISTRO DE NOVA OCORRÊNCIA FITOSSANITÁRIA (TELA 08 FIDELIDADE TOTAL) */}
      {modalNewOccurOpen && (
        <div className="modal-backdrop open" onClick={() => setModalNewOccurOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Registrar Ocorrência Fitossanitária em Campo</h3>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Amostragem Georreferenciada • Telemetria MAPA / SIRGAS 2000
                </span>
              </div>
              <button className="modal-close" onClick={() => setModalNewOccurOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateNewOccurrenceSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Talhão Alvo</label>
                  <CustomSelect
                    value={occurTalhao}
                    onChange={(val) => setOccurTalhao(val)}
                    options={[
                      'Talhão 01 • Sede (110 ha)',
                      'Talhão 02 • Pivô Central (180 ha)',
                      'Talhão 03 • Área Vizinha (120 ha)',
                      'Talhão 04 • Baixada Norte (125 ha)',
                      'Talhão 05 • Milho Alto (210 ha)',
                      'Talhão 07 • Divisa Leste (210 ha)',
                    ]}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Agente Patogênico / Praga</label>
                    <CustomSelect
                      value={occurAgente}
                      onChange={(val) => setOccurAgente(val)}
                      options={[
                        'Ferrugem Asiática (Phakopsora pachyrhizi)',
                        'Lagarta-do-cartucho (Spodoptera frugiperda)',
                        'Percevejo-marrom (Euschistus heros)',
                        'Antracnose (Colletotrichum truncatum)',
                        'Cigarrinha-do-milho (Dalbulus maidis)',
                      ]}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Severidade Estimada</label>
                    <CustomSelect
                      value={occurSeveridade}
                      onChange={(val) => setOccurSeveridade(val as 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA')}
                      options={[
                        { value: 'CRITICA', label: 'Crítica (>20% severidade foliar)', badge: { text: 'CRÍTICA', className: 'badge-danger' } },
                        { value: 'ALTA', label: 'Alta (10-20%)', badge: { text: 'ALTA', className: 'badge-warn' } },
                        { value: 'MEDIA', label: 'Média (5-10%)', badge: { text: 'MÉDIA', className: 'badge-info' } },
                        { value: 'BAIXA', label: 'Baixa (<5%)', badge: { text: 'BAIXA', className: 'badge-accent' } },
                      ]}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Latitude GPS</label>
                    <input
                      type="text"
                      className="form-input"
                      value={occurLat}
                      onChange={(e) => setOccurLat(e.target.value)}
                      style={{ fontFamily: 'var(--font-mono)' }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude GPS</label>
                    <input
                      type="text"
                      className="form-input"
                      value={occurLon}
                      onChange={(e) => setOccurLon(e.target.value)}
                      style={{ fontFamily: 'var(--font-mono)' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Evidência Fotográfica / Laudo de Campo</label>
                  <div className="upload-dropzone" onClick={handleSimulatePhotoUpload}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                    <div style={{ fontSize: '12.5px', fontWeight: 500, color: occurPhotoLoaded ? 'var(--accent-text)' : 'var(--text-primary)' }}>
                      {occurPhotoLoaded
                        ? '✓ Foto "amostra_folha_pustula_04.jpg" carregada (GPS & EXIF incorporados)'
                        : 'Clique para anexar foto da folha/praga com sensor de campo'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Suporte a JPG, PNG e RAW geotaggeados • Reconhecimento automático via IA
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Observações Fitotécnicas</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={occurObs}
                    onChange={(e) => setOccurObs(e.target.value)}
                    placeholder="Ex: Presença de uredósporos maduros na face abaxial em estágio R3..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalNewOccurOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar & Sincronizar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ORDEM DE PULVERIZAÇÃO EMERGENCIAL (OS) */}
      {modalSprayOpen && (
        <div className="modal-backdrop open" onClick={() => setModalSprayOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '20px', height: '20px', color: 'var(--accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
                </svg>
                <span>Emitir Ordem de Serviço de Pulverização (OS)</span>
              </div>
              <button className="modal-close" onClick={() => setModalSprayOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateSprayOrderSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Talhão Alvo</label>
                  <input type="text" className="form-input" value={sprayForm.talhao} readOnly style={{ fontWeight: 600 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Patógeno Alvo</label>
                    <input type="text" className="form-input" value={sprayForm.agente} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Insumo Prescrito (Galpão 01)</label>
                    <input type="text" className="form-input" value={sprayForm.produto} readOnly style={{ color: 'var(--accent-text)', fontWeight: 600 }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Maquinário Designado</label>
                    <CustomSelect
                      value={sprayForm.maquina}
                      onChange={(val) => setSprayForm({ ...sprayForm, maquina: val })}
                      options={[
                        'PV-01 • Jacto Uniport 3030 (Barra 36m • Disponível)',
                        'PV-02 • Pulverizador Autopropelido 24m (Standby)',
                        'DR-01 • Drone DJI Agras T40 (Autônomo)',
                      ]}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dose Recomendada</label>
                    <input
                      type="text"
                      className="form-input"
                      value={sprayForm.dose}
                      onChange={(e) => setSprayForm({ ...sprayForm, dose: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Janela Meteorológica de Aplicação</label>
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--accent-text)' }}>
                    ✓ Condição ideal nas próximas 6 horas: Vento 12-14 km/h, UR 75%, sem previsão de chuva até 18:00.
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalSprayOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Transmitir OS via CAN Bus ao Trator</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VISUALIZAÇÃO AMPLIADA DA FOTO DE LAUDO COM IA */}
      {modalPhotoOpen && (
        <div className="modal-backdrop open" onClick={() => setModalPhotoOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Laudo Fotográfico com Reconhecimento IA</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Amostra {selectedOccurrence.code} • {selectedOccurrence.talhao} • Capturado via App Seed Mobile
                </div>
              </div>
              <button className="modal-close" onClick={() => setModalPhotoOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '16px' }}>
              <div className="photo-full-display">
                <img src={selectedOccurrence.img} alt="Foto Ampliada de Fitopatologia" />
                <div
                  style={{
                    position: 'absolute',
                    top: '28%',
                    left: '36%',
                    width: '180px',
                    height: '140px',
                    border: '3px dashed #ef4444',
                    background: 'rgba(239, 68, 68, 0.18)',
                    borderRadius: '6px',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '-22px',
                      left: 0,
                      background: 'var(--danger)',
                      color: '#000',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '3px',
                    }}
                  >
                    {selectedOccurrence.agentScientific} ({selectedOccurrence.confidence}%)
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                <span>Câmera: Sony IMX Sensor • Abertura f/1.8 • ISO 100</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>GPS: {selectedOccurrence.gps} • Altitude: 412m</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModalPhotoOpen(false)}>Fechar</button>
              <button className="btn btn-primary" onClick={() => showToast('Laudo sanitário exportado em formato PDF oficial MAPA!')}>
                Baixar Laudo Assinado (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
