import React, { useState } from 'react';

export interface SafraTalhao {
  id: number;
  talhaoNome: string;
  talhaoDesc: string;
  area: string;
  areaNum: number;
  cultura: 'soja' | 'milho' | 'pousio';
  culturaNome: string;
  variedade: string;
  dataPlantio: string;
  dae: string;
  estagio: string;
  estagioPct: number;
  produtividade: string;
  volume: string;
  custoHa: string;
  status: 'EM ANDAMENTO' | 'DESENVOLVIMENTO' | 'PRÉ-COLHEITA' | 'RISCO FITO' | 'POUSIO ESG';
}

const INITIAL_SAFRAS_DATA: SafraTalhao[] = [
  {
    id: 1,
    talhaoNome: 'Talhão 01 — Sede',
    talhaoDesc: '110,0 ha • Solo Argiloso',
    area: '110,0 ha',
    areaNum: 110.0,
    cultura: 'soja',
    culturaNome: 'Soja',
    variedade: 'BRS 511 (Precoce)',
    dataPlantio: '20/10/2024',
    dae: '72 DAE',
    estagio: 'R1 Floração',
    estagioPct: 65,
    produtividade: '66,0 sc/ha',
    volume: '7.260 sc',
    custoHa: 'R$ 4.210',
    status: 'EM ANDAMENTO',
  },
  {
    id: 2,
    talhaoNome: 'Talhão 02 — Pivô Central',
    talhaoDesc: '140,0 ha • Solo Misto',
    area: '140,0 ha',
    areaNum: 140.0,
    cultura: 'soja',
    culturaNome: 'Soja',
    variedade: 'BRS 511 (Precoce)',
    dataPlantio: '15/10/2024',
    dae: '77 DAE',
    estagio: 'R1 Floração',
    estagioPct: 72,
    produtividade: '68,0 sc/ha',
    volume: '9.520 sc',
    custoHa: 'R$ 4.350',
    status: 'EM ANDAMENTO',
  },
  {
    id: 3,
    talhaoNome: 'Talhão 03 — Platô Alto',
    talhaoDesc: '95,0 ha • Solo Arenoso',
    area: '95,0 ha',
    areaNum: 95.0,
    cultura: 'soja',
    culturaNome: 'Soja',
    variedade: 'DM 66i68 (Médio)',
    dataPlantio: '22/10/2024',
    dae: '70 DAE',
    estagio: 'R2 Vagens',
    estagioPct: 60,
    produtividade: '64,0 sc/ha',
    volume: '6.080 sc',
    custoHa: 'R$ 4.190',
    status: 'EM ANDAMENTO',
  },
  {
    id: 4,
    talhaoNome: 'Talhão 04 — Baixada Norte',
    talhaoDesc: '125,0 ha • Alerta Sanitário',
    area: '125,0 ha',
    areaNum: 125.0,
    cultura: 'soja',
    culturaNome: 'Soja',
    variedade: 'DM 66i68 (Médio)',
    dataPlantio: '18/10/2024',
    dae: '74 DAE',
    estagio: 'R2 Vagens (Risco)',
    estagioPct: 68,
    produtividade: '58,0 sc/ha',
    volume: '7.250 sc',
    custoHa: 'R$ 4.490',
    status: 'RISCO FITO',
  },
  {
    id: 5,
    talhaoNome: 'Talhão 05 — Cerca Velha',
    talhaoDesc: '180,0 ha • Solo Argiloso',
    area: '180,0 ha',
    areaNum: 180.0,
    cultura: 'milho',
    culturaNome: 'Milho',
    variedade: 'DKB 360 PRO4',
    dataPlantio: '05/11/2024',
    dae: '56 DAE',
    estagio: 'V4 Vegetativo',
    estagioPct: 45,
    produtividade: '120,0 sc/ha',
    volume: '21.600 sc',
    custoHa: 'R$ 3.890',
    status: 'DESENVOLVIMENTO',
  },
  {
    id: 6,
    talhaoNome: 'Talhão 06 — Represa',
    talhaoDesc: '160,0 ha • Irrigação Pivô',
    area: '160,0 ha',
    areaNum: 160.0,
    cultura: 'milho',
    culturaNome: 'Milho',
    variedade: 'DKB 360 PRO4',
    dataPlantio: '02/11/2024',
    dae: '59 DAE',
    estagio: 'V6 Vegetativo',
    estagioPct: 50,
    produtividade: '115,0 sc/ha',
    volume: '18.400 sc',
    custoHa: 'R$ 3.920',
    status: 'DESENVOLVIMENTO',
  },
  {
    id: 7,
    talhaoNome: 'Talhão 07 — Divisa Leste',
    talhaoDesc: '210,0 ha • Solo Argiloso',
    area: '210,0 ha',
    areaNum: 210.0,
    cultura: 'soja',
    culturaNome: 'Soja',
    variedade: 'BRS 511 (Precoce)',
    dataPlantio: '12/10/2024',
    dae: '80 DAE',
    estagio: 'R3 Granação',
    estagioPct: 80,
    produtividade: '65,0 sc/ha',
    volume: '13.650 sc',
    custoHa: 'R$ 4.240',
    status: 'PRÉ-COLHEITA',
  },
  {
    id: 8,
    talhaoNome: 'Talhão 08 — Reserva & Palhada',
    talhaoDesc: '200,0 ha • Manejo Conservacionista',
    area: '200,0 ha',
    areaNum: 200.0,
    cultura: 'pousio',
    culturaNome: 'Pousio ESG',
    variedade: 'Braquiária Ruziziensis',
    dataPlantio: '—',
    dae: 'Palhada Ativa',
    estagio: 'Cobertura',
    estagioPct: 100,
    produtividade: '—',
    volume: '—',
    custoHa: 'R$ 680',
    status: 'POUSIO ESG',
  },
];

export const SafrasPlanejamento: React.FC = () => {
  const [safrasData, setSafrasData] = useState<SafraTalhao[]>(INITIAL_SAFRAS_DATA);
  const [selectedSeason, setSelectedSeason] = useState<string>('Safra Principal 2024/25');
  const [seasonMenuOpen, setSeasonMenuOpen] = useState<boolean>(false);
  const [culturaFilter, setCulturaFilter] = useState<'all' | 'soja' | 'milho' | 'pousio'>('all');
  
  // Modais e gaveta
  const [modalNewOpen, setModalNewOpen] = useState<boolean>(false);
  const [modalDetailOpen, setModalDetailOpen] = useState<boolean>(false);
  const [selectedSafra, setSelectedSafra] = useState<SafraTalhao | null>(null);
  
  // Form Nova Safra
  const [formData, setFormData] = useState({
    talhao: 'Talhão 01 — Sede (110 ha)',
    cultura: 'Soja',
    variedade: 'BRS 511',
    dataPlantio: '2025-02-05',
    dataColheita: '2025-06-15',
    metaProd: 66.0,
    custoHa: 4250,
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Filtragem dos talhões
  const filteredSafras = safrasData.filter((item) => {
    if (culturaFilter === 'all') return true;
    return item.cultura === culturaFilter;
  });

  // Exportar Cronograma em CSV
  const handleExportCronograma = () => {
    const headers = ['Talhão', 'Área', 'Cultura', 'Variedade', 'Data Plantio', 'DAE', 'Estágio', 'Produtividade', 'Volume', 'Custo/ha', 'Status'];
    const rows = safrasData.map((s) => [
      s.talhaoNome,
      s.area,
      s.culturaNome,
      s.variedade,
      s.dataPlantio,
      s.dae,
      s.estagio,
      s.produtividade,
      s.volume,
      s.custoHa,
      s.status,
    ]);

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seed_cronograma_safras_${selectedSeason.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Cronograma de safras exportado em formato CSV estruturado com sucesso!');
  };

  // Abrir detalhes de um talhão
  const handleOpenDetail = (safra: SafraTalhao) => {
    setSelectedSafra(safra);
    setModalDetailOpen(true);
  };

  // Criar nova safra
  const handleCreateSafraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const talhaoNomeOnly = formData.talhao.split(' (')[0];
    const areaMatch = formData.talhao.match(/\((\d+)\s*ha\)/);
    const areaNum = areaMatch ? parseFloat(areaMatch[1]) : 100;
    const volumeTotal = Math.round(areaNum * formData.metaProd);

    const newEntry: SafraTalhao = {
      id: Date.now(),
      talhaoNome: talhaoNomeOnly,
      talhaoDesc: `${areaNum},0 ha • Planejada`,
      area: `${areaNum},0 ha`,
      areaNum: areaNum,
      cultura: formData.cultura.toLowerCase().includes('milho') ? 'milho' : 'soja',
      culturaNome: formData.cultura,
      variedade: formData.variedade,
      dataPlantio: formData.dataPlantio.split('-').reverse().join('/'),
      dae: '0 DAE (Previsto)',
      estagio: 'Semeadura Programada',
      estagioPct: 10,
      produtividade: `${formData.metaProd.toFixed(1)} sc/ha`,
      volume: `${volumeTotal.toLocaleString('pt-BR')} sc`,
      custoHa: `R$ ${formData.custoHa.toLocaleString('pt-BR')}`,
      status: 'EM ANDAMENTO',
    };

    setSafrasData((prev) => [newEntry, ...prev]);
    setModalNewOpen(false);
    showToast(`Novo ciclo de safra para ${talhaoNomeOnly} registrado com sucesso no planejamento!`);
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

      {/* Cabeçalho de Página com Seletor de Safra e Ações */}
      <div className="page-header stagger-item">
        <div className="page-header-left">
          <h1 className="page-heading">Ciclo de Safras & Planejamento Produtivo</h1>
          <p className="page-subheading">
            Janelas agronômicas de plantio e colheita, estágios fenológicos e balanço estimado vs. realizado
          </p>
        </div>

        <div className="header-actions">
          {/* Seletor de Safra Dropdown */}
          <div className="season-selector">
            <button className="season-btn" onClick={() => setSeasonMenuOpen(!seasonMenuOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <span>{selectedSeason}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div className={`season-menu ${seasonMenuOpen ? 'open' : ''}`}>
              {['Safra Principal 2024/25', 'Safrinha Milho 2025 (Planejamento)', 'Safra 2023/24 (Consolidada)'].map((s) => (
                <div
                  key={s}
                  className={`season-opt ${selectedSeason === s ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedSeason(s);
                    setSeasonMenuOpen(false);
                    showToast(`Visualizando planejamento: ${s}`);
                  }}
                >
                  <span>{s}</span>
                  {selectedSeason === s && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-outline" onClick={handleExportCronograma}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exportar Cronograma
          </button>
          
          <button className="btn btn-primary" onClick={() => setModalNewOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Planejar Nova Safra
          </button>
        </div>
      </div>

      {/* Mini KPI Strip Agronômico (4 Métricas Mestres) */}
      <div className="kpi-strip stagger-item">
        <div className="kpi-cell">
          <span className="kpi-cell-label">Área Sob Cultivo Ativo</span>
          <div className="kpi-cell-val">1.420,0 <span className="unit">ha</span></div>
          <span className="kpi-cell-sub">76,7% da fazenda • 14 talhões vinculados</span>
        </div>
        <div className="kpi-cell">
          <span className="kpi-cell-label">Estimativa de Produção</span>
          <div className="kpi-cell-val">91.590 <span className="unit">sc</span></div>
          <span className="kpi-cell-sub" style={{ color: 'var(--accent-text)' }}>Média ponderada: 64,5 sc/ha</span>
        </div>
        <div className="kpi-cell">
          <span className="kpi-cell-label">Janela Crítica de Colheita</span>
          <div className="kpi-cell-val">22 Jan <span className="unit">— 25 Fev</span></div>
          <span className="kpi-cell-sub">Fase R3 Enchimento • 38 dias restantes</span>
        </div>
        <div className="kpi-cell">
          <span className="kpi-cell-label">Balanço de Custo & Break-even</span>
          <div className="kpi-cell-val">R$ 4.280 <span className="unit">/ha</span></div>
          <span className="kpi-cell-sub">Ponto de equilíbrio: 41,2 sc/ha</span>
        </div>
      </div>

      {/* LINHA DO TEMPO AGRONÔMICA & GANTT FENOLÓGICO */}
      <div className="timeline-card stagger-item">
        <div className="timeline-card-header">
          <div className="timeline-heading">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '18px', height: '18px', color: 'var(--accent)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
            Cronograma Fenológico & Janela Agronômica
          </div>
          <div className="timeline-legend">
            <div className="legend-item"><span className="legend-dot" style={{ background: 'rgba(16, 185, 129, 0.4)' }}></span><span>Concluído</span></div>
            <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--accent)' }}></span><span>Fase Atual (Em Curso)</span></div>
            <div className="legend-item"><span className="legend-dot" style={{ background: 'rgba(245, 158, 11, 0.6)' }}></span><span>Colheita</span></div>
            <div className="legend-item"><span className="legend-dot" style={{ background: 'rgba(239, 68, 68, 0.5)' }}></span><span>Janela Limite Safrinha</span></div>
          </div>
        </div>

        <div className="gantt-container">
          {/* Régua Superior Integrada: Rótulo de Coluna + Meses do Ano */}
          <div className="gantt-header-row">
            <div className="gantt-col-header">Cultivar / Talhões</div>
            <div className="gantt-months-scale">
              <div className="gantt-month">Out 2024</div>
              <div className="gantt-month">Nov 2024</div>
              <div className="gantt-month">Dez 2024</div>
              <div className="gantt-month active-month">Jan 2025</div>
              <div className="gantt-month">Fev 2025</div>
              <div className="gantt-month">Mar 2025</div>
            </div>
          </div>

          {/* Grade Principal do Cronograma */}
          <div className="gantt-layout">
            {/* Coluna da Esquerda: Cultivares e Metadados */}
            <div className="gantt-labels-col">
              <div className="gantt-label-card">
                <span className="gantt-label-title">Soja BRS 511</span>
                <span className="gantt-label-sub">Talhões T01, T02, T07 (760 ha)</span>
              </div>
              <div className="gantt-label-card">
                <span className="gantt-label-title">Soja DM 66i68</span>
                <span className="gantt-label-sub">Talhões T03, T04 (220 ha)</span>
              </div>
              <div className="gantt-label-card">
                <span className="gantt-label-title">Milho Safrinha 2025</span>
                <span className="gantt-label-sub">Sucessão pós-Soja (340 ha)</span>
              </div>
            </div>

            {/* Coluna da Direita: Trilhas Fenológicas + Marcador Hoje */}
            <div className="gantt-tracks-col">
              {/* Marcador 'Hoje' posicionado */}
              <div className="today-marker">
                <span className="today-flag">HOJE • R3</span>
              </div>

              {/* Trilha 1: Soja BRS 511 */}
              <div className="gantt-track">
                <div className="gantt-segment seg-done" style={{ left: '2%', width: '11%' }} title="Preparo Solo (Concluído)">Preparo Solo</div>
                <div className="gantt-segment seg-done" style={{ left: '13.5%', width: '13.5%' }} title="Plantio VE-V3">Plantio (VE - V3)</div>
                <div className="gantt-segment seg-done" style={{ left: '27.5%', width: '17%' }} title="Vegetativo V4-V6">Vegetativo (V4 - V6)</div>
                <div className="gantt-segment seg-active" style={{ left: '45%', width: '18%' }} title="R1-R3 Floração (Fase Ativa)">R1 - R3 Floração</div>
                <div className="gantt-segment seg-upcoming" style={{ left: '63.5%', width: '16%' }} title="R4-R7 Maturação (Previsto)">R4 - R7 Maturação</div>
                <div className="gantt-segment seg-harvest" style={{ left: '80%', width: '14%' }} title="Colheita Mecanizada">Colheita Mecanizada</div>
              </div>

              {/* Trilha 2: Soja DM 66i68 */}
              <div className="gantt-track">
                <div className="gantt-segment seg-done" style={{ left: '6%', width: '11%' }} title="Preparo Solo">Preparo Solo</div>
                <div className="gantt-segment seg-done" style={{ left: '17.5%', width: '14%' }} title="Semeadura">Semeadura</div>
                <div className="gantt-segment seg-done" style={{ left: '32%', width: '17%' }} title="Vigor V4-V6">Vigor V4 - V6</div>
                <div className="gantt-segment seg-active" style={{ left: '49.5%', width: '17%' }} title="R2 Vagens">R2 Vagens / Floração</div>
                <div className="gantt-segment seg-upcoming" style={{ left: '67%', width: '15%' }} title="R4-R6 Enchimento">R4 - R6 Enchimento</div>
                <div className="gantt-segment seg-harvest" style={{ left: '82.5%', width: '14%' }} title="Colheita Mecanizada">Colheita Mecanizada</div>
              </div>

              {/* Trilha 3: Safrinha Milho DKB 360 */}
              <div className="gantt-track">
                <div className="gantt-segment seg-upcoming" style={{ left: '68%', width: '15%' }} title="Janela Ótima Plantio">Janela Ótima Plantio</div>
                <div className="gantt-segment seg-safrinha-alert" style={{ left: '83.5%', width: '15.5%' }} title="Limite de Risco Climático ZARC (Zoneamento Agrícola)">
                  Limite Risco ZARC
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAIXA DE AGROMETEOROLOGIA & RISCO CLIMÁTICO (INMET / CPTEC) */}
      <div className="climate-row stagger-item">
        <div className="climate-card">
          <div className="climate-icon emerald">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
            </svg>
          </div>
          <div className="climate-content">
            <span className="climate-title">Regime Pluviométrico (15 Dias)</span>
            <span className="climate-desc">85 mm acumulados previstos. Janela seca favorável para pulverização entre 14 e 18 de Janeiro.</span>
            <span className="climate-meta">Estação INMET Sorriso • Confiança 91%</span>
          </div>
        </div>

        <div className="climate-card">
          <div className="climate-icon info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          </div>
          <div className="climate-content">
            <span className="climate-title">Graus-Dia Acumulados (GDA)</span>
            <span className="climate-desc">1.420 °C-dia acumulados desde a emergência. Curva de maturação alinhada ao ciclo de 115 dias.</span>
            <span className="climate-meta">Temperatura base: 10°C • Modelo agronômico</span>
          </div>
        </div>

        <div className="climate-card">
          <div className="climate-icon warn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div className="climate-content">
            <span className="climate-title">Alerta de Safrinha 2025</span>
            <span className="climate-desc">Janela de semeadura recomendada até 28/02 para mitigar o corte de chuvas em Maio/Junho.</span>
            <span className="climate-meta">Simulação de Risco ZARC / Embrapa</span>
          </div>
        </div>
      </div>

      {/* TABELA MATRIZ: GESTÃO DETALHADA POR TALHÃO */}
      <div className="table-section stagger-item">
        <div className="table-header-bar">
          <div>
            <h2 className="table-title">Talhões em Monitoramento de Safra</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Acompanhamento de DAE (Dias Após Emergência), biometria e estimativa de colheita
            </span>
          </div>

          <div className="table-filters">
            <div
              className={`filter-chip ${culturaFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCulturaFilter('all')}
            >
              <span>Todos ({safrasData.length})</span>
            </div>
            <div
              className={`filter-chip ${culturaFilter === 'soja' ? 'active' : ''}`}
              onClick={() => setCulturaFilter('soja')}
            >
              <span className="chip-dot" style={{ background: 'var(--accent)' }}></span>
              <span>Soja ({safrasData.filter((s) => s.cultura === 'soja').length})</span>
            </div>
            <div
              className={`filter-chip ${culturaFilter === 'milho' ? 'active' : ''}`}
              onClick={() => setCulturaFilter('milho')}
            >
              <span className="chip-dot" style={{ background: 'var(--warning)' }}></span>
              <span>Milho ({safrasData.filter((s) => s.cultura === 'milho').length})</span>
            </div>
            <div
              className={`filter-chip ${culturaFilter === 'pousio' ? 'active' : ''}`}
              onClick={() => setCulturaFilter('pousio')}
            >
              <span className="chip-dot" style={{ background: 'var(--text-muted)' }}></span>
              <span>Pousio ESG ({safrasData.filter((s) => s.cultura === 'pousio').length})</span>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Talhão & Área</th>
                <th>Cultura & Variedade</th>
                <th>Data Plantio / DAE</th>
                <th>Estágio Fenológico</th>
                <th>Produtividade Est.</th>
                <th>Volume Previsto</th>
                <th>Custo / ha</th>
                <th>Status Safra</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSafras.map((s) => (
                <tr
                  key={s.id}
                  style={{
                    background: s.status === 'RISCO FITO' ? 'rgba(239, 68, 68, 0.04)' : undefined,
                  }}
                >
                  <td>
                    <div className="cell-title" style={{ color: s.status === 'RISCO FITO' ? '#fca5a5' : undefined }}>
                      {s.talhaoNome}
                    </div>
                    <div className="cell-sub cell-mono">{s.talhaoDesc}</div>
                  </td>
                  <td>
                    <div className="cell-title">{s.culturaNome}</div>
                    <div className="cell-sub">{s.variedade}</div>
                  </td>
                  <td>
                    <div className="cell-mono">{s.dataPlantio}</div>
                    <div
                      className="cell-sub cell-mono"
                      style={{
                        color: s.cultura === 'milho' ? 'var(--warning)' : s.cultura === 'soja' ? 'var(--accent-text)' : undefined,
                      }}
                    >
                      {s.dae}
                    </div>
                  </td>
                  <td>
                    <div className="progress-box">
                      <div className="progress-label">
                        <span style={{ color: s.status === 'RISCO FITO' ? 'var(--danger)' : undefined }}>
                          {s.estagio}
                        </span>
                        <span>{s.estagioPct}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${s.estagioPct}%`,
                            background:
                              s.status === 'RISCO FITO'
                                ? 'var(--danger)'
                                : s.cultura === 'milho'
                                ? 'var(--warning)'
                                : s.cultura === 'pousio'
                                ? '#71717a'
                                : 'var(--accent)',
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="cell-mono" style={{ color: s.status === 'RISCO FITO' ? 'var(--danger)' : undefined }}>
                    {s.produtividade}
                  </td>
                  <td className="cell-mono">{s.volume}</td>
                  <td className="cell-mono">{s.custoHa}</td>
                  <td>
                    {s.status === 'RISCO FITO' ? (
                      <span className="status-pill" style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}>
                        RISCO FITO
                      </span>
                    ) : s.status === 'PRÉ-COLHEITA' ? (
                      <span className="status-pill" style={{ background: 'var(--info-muted)', color: '#93c5fd' }}>
                        PRÉ-COLHEITA
                      </span>
                    ) : s.status === 'DESENVOLVIMENTO' ? (
                      <span className="status-pill" style={{ background: 'var(--warning-muted)', color: 'var(--warning)' }}>
                        DESENVOLVIMENTO
                      </span>
                    ) : s.status === 'POUSIO ESG' ? (
                      <span className="status-pill" style={{ background: 'rgba(113, 113, 122, 0.2)', color: 'var(--text-muted)' }}>
                        POUSIO ESG
                      </span>
                    ) : (
                      <span className="status-pill" style={{ background: 'var(--accent-muted)', color: 'var(--accent-text)' }}>
                        EM ANDAMENTO
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: '11.5px' }}
                      onClick={() => handleOpenDetail(s)}
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: + PLANEJAR NOVA SAFRA */}
      {modalNewOpen && (
        <div className="modal-backdrop open" onClick={() => setModalNewOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Planejar Novo Ciclo de Safra</h3>
              <button className="modal-close" onClick={() => setModalNewOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateSafraSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Talhão de Alocação</label>
                  <select
                    className="form-input"
                    value={formData.talhao}
                    onChange={(e) => setFormData({ ...formData, talhao: e.target.value })}
                  >
                    <option value="Talhão 01 — Sede (110 ha)">Talhão 01 — Sede (110 ha)</option>
                    <option value="Talhão 02 — Pivô Central (140 ha)">Talhão 02 — Pivô Central (140 ha)</option>
                    <option value="Talhão 03 — Platô Alto (95 ha)">Talhão 03 — Platô Alto (95 ha)</option>
                    <option value="Talhão 05 — Cerca Velha (180 ha)">Talhão 05 — Cerca Velha (180 ha)</option>
                    <option value="Talhão 07 — Divisa Leste (210 ha)">Talhão 07 — Divisa Leste (210 ha)</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Cultura Principal</label>
                    <select
                      className="form-input"
                      value={formData.cultura}
                      onChange={(e) => setFormData({ ...formData, cultura: e.target.value })}
                    >
                      <option value="Soja">Soja</option>
                      <option value="Milho Safrinha">Milho Safrinha</option>
                      <option value="Algodão">Algodão</option>
                      <option value="Sorgo / Forrageira">Sorgo / Forrageira</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cultivar / Variedade</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.variedade}
                      onChange={(e) => setFormData({ ...formData, variedade: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Data Prevista de Plantio</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.dataPlantio}
                      onChange={(e) => setFormData({ ...formData, dataPlantio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Previsão de Colheita</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.dataColheita}
                      onChange={(e) => setFormData({ ...formData, dataColheita: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Meta Produtividade (sc/ha)</label>
                    <div className="stepper-wrap">
                      <input
                        type="number"
                        step="0.5"
                        className="form-input"
                        value={formData.metaProd}
                        onChange={(e) => setFormData({ ...formData, metaProd: parseFloat(e.target.value) || 0 })}
                        required
                      />
                      <div className="stepper-btns">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormData({ ...formData, metaProd: formData.metaProd + 0.5 })}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormData({ ...formData, metaProd: Math.max(0, formData.metaProd - 0.5) })}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Custo Estimado (R$/ha)</label>
                    <div className="stepper-wrap">
                      <input
                        type="number"
                        step="50"
                        className="form-input"
                        value={formData.custoHa}
                        onChange={(e) => setFormData({ ...formData, custoHa: parseInt(e.target.value) || 0 })}
                        required
                      />
                      <div className="stepper-btns">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormData({ ...formData, custoHa: formData.custoHa + 50 })}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormData({ ...formData, custoHa: Math.max(0, formData.custoHa - 50) })}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalNewOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar no Planejamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL DE DETALHES DE SAFRA */}
      {modalDetailOpen && selectedSafra && (
        <div className="modal-backdrop open" onClick={() => setModalDetailOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedSafra.talhaoNome}</h3>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {selectedSafra.culturaNome} {selectedSafra.variedade} • {selectedSafra.area}
                </span>
              </div>
              <button className="modal-close" onClick={() => setModalDetailOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Produtividade Meta</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-text)' }}>
                    {selectedSafra.produtividade}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Volume Estimado</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {selectedSafra.volume}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estágio Fenológico</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, marginTop: '4px' }}>
                    {selectedSafra.estagio}
                  </div>
                </div>
              </div>

              <div>
                <span className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                  Curva Estimada de Maturação (R1 a R8)
                </span>
                <div style={{ height: '120px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ flex: 1, height: '30%', background: 'var(--border)', borderRadius: '4px 4px 0 0' }} title="V4 Vegetativo"></div>
                  <div style={{ flex: 1, height: '50%', background: 'var(--border)', borderRadius: '4px 4px 0 0' }} title="V6"></div>
                  <div style={{ flex: 1, height: '75%', background: 'var(--accent)', borderRadius: '4px 4px 0 0' }} title="R1 Floração (Atual)"></div>
                  <div style={{ flex: 1, height: '85%', background: 'rgba(59, 130, 246, 0.4)', borderRadius: '4px 4px 0 0' }} title="R3 Granação"></div>
                  <div style={{ flex: 1, height: '95%', background: 'rgba(59, 130, 246, 0.4)', borderRadius: '4px 4px 0 0' }} title="R5 Enchimento"></div>
                  <div style={{ flex: 1, height: '100%', background: 'rgba(245, 158, 11, 0.5)', borderRadius: '4px 4px 0 0' }} title="R8 Colheita"></div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'rgba(24, 24, 27, 0.5)', padding: '10px 12px', borderRadius: '6px', borderLeft: '2px solid var(--accent)' }}>
                Recomenda-se realizar amostragem de vagens por nó em 15 pontos do talhão nos próximos 5 dias para refinamento da margem de erro da colheita.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModalDetailOpen(false)}>
                Fechar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  showToast(`Amostragem biométrica de campo aberta para ${selectedSafra.talhaoNome}!`);
                  setModalDetailOpen(false);
                }}
              >
                Lançar Amostragem de Campo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
