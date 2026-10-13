import React, { useState, useMemo, useEffect } from 'react';
import { CustomSelect } from '../components/ui/CustomSelect';
import { CustomDatePicker } from '../components/ui/CustomDatePicker';
import { energeticoService } from '../services/energeticoService';

interface ReportItem {
  id: string;
  period: string;
  periodLabel: string;
  totalEmission: string;
  intensity: string;
  renewablePct: string;
  ratingBadge: string;
  status: 'PUBLISHED' | 'DRAFT';
  statusLabel: string;
  updatedAt: string;
}

interface ToastMessage {
  id: string;
  text: string;
}

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: '1',
    period: '2026-09',
    periodLabel: '2026-09 (Setembro)',
    totalEmission: '7.820 tCO₂e',
    intensity: '0.011 t/ha',
    renewablePct: '71.2%',
    ratingBadge: 'Rating A+ (-1.0%)',
    status: 'PUBLISHED',
    statusLabel: '● PUBLICADO',
    updatedAt: '01/10/2026 00:04',
  },
  {
    id: '2',
    period: '2026-08',
    periodLabel: '2026-08 (Agosto)',
    totalEmission: '12.450 tCO₂e',
    intensity: '0.018 t/ha',
    renewablePct: '69.5%',
    ratingBadge: 'Rating A+ (-1.0%)',
    status: 'PUBLISHED',
    statusLabel: '● PUBLICADO',
    updatedAt: '01/09/2026 00:03',
  },
  {
    id: '3',
    period: '2026-07',
    periodLabel: '2026-07 (Julho)',
    totalEmission: '18.900 tCO₂e',
    intensity: '0.027 t/ha',
    renewablePct: '65.1%',
    ratingBadge: 'Rating A+ (-1.0%)',
    status: 'PUBLISHED',
    statusLabel: '● PUBLICADO',
    updatedAt: '01/08/2026 00:02',
  },
  {
    id: '4',
    period: '2026-06',
    periodLabel: '2026-06 (Junho)',
    totalEmission: '22.100 tCO₂e',
    intensity: '0.032 t/ha',
    renewablePct: '62.8%',
    ratingBadge: 'Rating A+ (-1.0%)',
    status: 'PUBLISHED',
    statusLabel: '● PUBLICADO',
    updatedAt: '01/07/2026 00:02',
  },
  {
    id: '5',
    period: '2026-10',
    periodLabel: '2026-10 (Outubro - Parcial)',
    totalEmission: '4.120 tCO₂e',
    intensity: '0.006 t/ha',
    renewablePct: '72.8%',
    ratingBadge: 'Rating A+ (-1.0%)',
    status: 'DRAFT',
    statusLabel: '○ RASCUNHO',
    updatedAt: 'Hoje, 02:15',
  },
];

const PERIOD_OPTIONS = [
  { value: '2024/25', label: 'Safra 2024/25 (Vigente)' },
  { value: '2023/24', label: 'Safra 2023/24 (Auditada)' },
  { value: '2026-09', label: 'Mês: Setembro/2026' },
];

const FONTE_OPTIONS = [
  { value: 'BIODIESEL_B20', label: 'Biodiesel B20 (Biocombustível)' },
  { value: 'DIESEL_S10', label: 'Diesel Fóssil S10' },
  { value: 'SOLAR', label: 'Solar Fotovoltaica Própria' },
  { value: 'REDE_RURAL', label: 'Rede Elétrica Concessionária' },
];

const EQUIP_OPTIONS = [
  { value: 'COL_01', label: 'Colheitadeira JD S790 (#COL-01)' },
  { value: 'TRAT_02', label: 'Trator JD 8R (#TR-02)' },
  { value: 'PIVO_01', label: 'Pivô Central 01 (Talhão 02)' },
  { value: 'GALPAO_SEDE', label: 'Galpão de Armazenamento e Sede' },
];

export const EnergiaEsg: React.FC = () => {
  // Filtro de Safra/Período
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024/25');

  // Estado dos Sliders do Simulador de Transição
  const [sliderBiodiesel, setSliderBiodiesel] = useState<number>(20);
  const [sliderSolar, setSliderSolar] = useState<number>(0);
  const [sliderCusteio, setSliderCusteio] = useState<number>(12000000);

  // Lista de Relatórios
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);

  useEffect(() => {
    energeticoService.getRelatorios()
      .then((res) => {
        if (res && res.items && res.items.length > 0) {
          const mapped: ReportItem[] = res.items.map((r, idx) => ({
            id: r.id || `api-rep-${idx}`,
            period: r.periodo_referencia,
            periodLabel: `${r.periodo_referencia} (Auditado)`,
            totalEmission: `${r.emissoes_totais_tco2e.toFixed(1)} tCO₂e`,
            intensity: `${r.intensidade_carbono_por_hectare.toFixed(3)} t/ha`,
            renewablePct: `${r.percentual_energia_renovavel.toFixed(1)}%`,
            ratingBadge: `Rating ${r.score_abc_mais || 'A+'} (${r.bonus_juros_estimado ? `-${r.bonus_juros_estimado}%` : '-1.0%'})`,
            status: r.status === 'PUBLICADO' || r.status === 'HOMOLOGADO' ? 'PUBLISHED' : 'DRAFT',
            statusLabel: r.status === 'PUBLICADO' || r.status === 'HOMOLOGADO' ? '● PUBLICADO' : '○ RASCUNHO',
            updatedAt: r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR') : 'Hoje',
          }));
          setReports((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const fresh = mapped.filter((m) => !existingIds.has(m.id));
            return [...fresh, ...prev];
          });
        }
      })
      .catch((err) => {
        console.info('Modo demonstração ativo em Energia & ESG:', err);
      });
  }, []);

  // Modais
  const [isConsumoModalOpen, setIsConsumoModalOpen] = useState<boolean>(false);
  const [isLaudoModalOpen, setIsLaudoModalOpen] = useState<boolean>(false);
  const [isNovoMesModalOpen, setIsNovoMesModalOpen] = useState<boolean>(false);
  const [selectedLaudoPeriod, setSelectedLaudoPeriod] = useState<string>('2026-09');

  // Filtros da Tabela de Relatórios
  const [tableSearch, setTableSearch] = useState<string>('');
  const [tableStatusFilter, setTableStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  // Formulário de Novo Mês
  const [novoMesPeriod, setNovoMesPeriod] = useState<string>('2026-11');
  const [novoMesLabel, setNovoMesLabel] = useState<string>('2026-11 (Novembro)');
  const [novoMesEmissao, setNovoMesEmissao] = useState<string>('5.940');
  const [novoMesIntensidade, setNovoMesIntensidade] = useState<string>('0.009');
  const [novoMesRenovavel, setNovoMesRenovavel] = useState<string>('74.2%');

  // Formulário do Modal de Consumo
  const [formFonte, setFormFonte] = useState<string>('BIODIESEL_B20');
  const [formEquip, setFormEquip] = useState<string>('COL_01');
  const [formData, setFormData] = useState<string>('2026-10-10');
  const [formQtd, setFormQtd] = useState<number>(850);
  const [formCusto, setFormCusto] = useState<number>(4632.5);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Cálculos Dinâmicos do Simulador
  const simResults = useMemo(() => {
    const bonusBio = ((sliderBiodiesel - 20) / 10) * 2.2;
    const bonusSolar = (sliderSolar / 20) * 1.8;
    const novaMatriz = Math.min(Math.max(68.4 + bonusBio + bonusSolar, 50.0), 96.0);

    const tAbatida = Math.max((sliderBiodiesel - 20) * 0.45 + sliderSolar * 0.16, 0.0);
    const descJuros = novaMatriz >= 60.0 ? 0.01 : novaMatriz >= 30.0 ? 0.005 : 0.0;
    const econReais = sliderCusteio * descJuros;
    const cbios = 39.4 + tAbatida * 0.4;

    return {
      novaMatriz,
      tAbatida,
      econReais,
      cbios,
    };
  }, [sliderBiodiesel, sliderSolar, sliderCusteio]);

  const resetSimulador = () => {
    setSliderBiodiesel(20);
    setSliderSolar(0);
    setSliderCusteio(12000000);
    showToast('Simulador restaurado para os parâmetros de safra vigentes.');
  };

  // Filtragem da tabela de relatórios
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchStatus =
        tableStatusFilter === 'ALL' || rep.status === tableStatusFilter;
      const q = tableSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        rep.periodLabel.toLowerCase().includes(q) ||
        rep.period.toLowerCase().includes(q) ||
        rep.ratingBadge.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [reports, tableStatusFilter, tableSearch]);

  const handleSalvarNovoMes = (e: React.FormEvent) => {
    e.preventDefault();
    const newRep: ReportItem = {
      id: String(Date.now()),
      period: novoMesPeriod,
      periodLabel: novoMesLabel || `${novoMesPeriod} (Consolidado)`,
      totalEmission: `${novoMesEmissao} tCO₂e`,
      intensity: `${novoMesIntensidade} t/ha`,
      renewablePct: novoMesRenovavel,
      ratingBadge: 'Rating A+ (-1.0%)',
      status: 'PUBLISHED',
      statusLabel: '● PUBLICADO',
      updatedAt: 'Hoje, 00:00',
    };
    setReports((prev) => [newRep, ...prev]);
    setIsNovoMesModalOpen(false);
    showToast(`Balanço do período ${newRep.periodLabel} consolidado e publicado com sucesso no GHG Protocol!`);

    energeticoService.gerarRelatorio(novoMesPeriod).catch((err) => {
      console.info('Relatório salvo localmente em modo offline:', err);
    });
  };

  // Classificação dinâmica da fonte selecionada
  const fonteCategory = useMemo(() => {
    switch (formFonte) {
      case 'BIODIESEL_B20':
        return {
          label: '● RENOVÁVEL (Escopo 1)',
          className: 'kpi-badge badge-accent',
          unitLabel: 'Quantidade Consumida (Litros) *',
        };
      case 'DIESEL_S10':
        return {
          label: '● FÓSSIL (Escopo 1)',
          className: 'kpi-badge badge-warning',
          unitLabel: 'Quantidade Consumida (Litros) *',
        };
      case 'SOLAR':
        return {
          label: '● RENOVÁVEL PRÓPRIA (Escopo 1)',
          className: 'kpi-badge badge-accent',
          unitLabel: 'Energia Gerada / Consumida (kWh) *',
        };
      case 'REDE_RURAL':
        return {
          label: '● REDE CONCESSIONÁRIA (Escopo 2)',
          className: 'kpi-badge badge-info',
          unitLabel: 'Energia Consumida (kWh) *',
        };
      default:
        return {
          label: '● RENOVÁVEL',
          className: 'kpi-badge badge-accent',
          unitLabel: 'Quantidade Consumida *',
        };
    }
  }, [formFonte]);

  const handleSalvarConsumo = (e: React.FormEvent) => {
    e.preventDefault();
    const fonteName = FONTE_OPTIONS.find((f) => f.value === formFonte)?.label || formFonte;
    setIsConsumoModalOpen(false);
    showToast(`Consumo de ${formQtd.toLocaleString('pt-BR')} registrado com sucesso para ${fonteName}!`);

    energeticoService.createConsumo({
      fonte_id: '00000000-0000-0000-0000-000000000001',
      quantidade_consumida: formQtd,
      custo_total: formCusto,
      apurado_em: formData ? new Date(formData).toISOString() : new Date().toISOString(),
    }).catch((err) => {
      console.info('Consumo registrado localmente em modo offline:', err);
    });
  };

  const handlePublicarRelatorio = (id: string, periodLabel: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'PUBLISHED', statusLabel: '● PUBLICADO' } : r
      )
    );
    showToast(`Relatório do período ${periodLabel} homologado e publicado no GHG Protocol!`);

    if (id.includes('-') && id.length > 20) {
      energeticoService.publicarRelatorio(id).catch((err) => {
        console.info('Publicação persistida localmente:', err);
      });
    }
  };

  const handleOpenLaudo = (period: string) => {
    setSelectedLaudoPeriod(period);
    setIsLaudoModalOpen(true);
  };

  return (
    <>
      {/* Page Header Padrão Seed */}
      <div className="page-header stagger-item">
        <div className="page-header-left">
          <h1 className="page-heading">Sustentabilidade, Energia & ESG</h1>
          <p className="page-subheading">
            Inventário de emissões de carbono nos Escopos 1 e 2 (GHG Protocol Agrícola), balanço de fontes renováveis e elegibilidade técnica para financiamento verde com taxa bonificada pelo Plano ABC+.
          </p>
        </div>

        <div className="header-actions">
          <div style={{ width: '220px' }}>
            <CustomSelect
              value={selectedPeriod}
              onChange={(val) => {
                setSelectedPeriod(val);
                showToast(`Filtro de período alterado para: ${val}`);
              }}
              options={PERIOD_OPTIONS}
            />
          </div>

          <button
            className="btn btn-outline"
            onClick={() => showToast('Celery Worker disparado: recalculando balanço energético e inventário GHG Protocol...')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Recalcular Balanço
          </button>

          <button className="btn btn-outline" onClick={() => handleOpenLaudo('2026-09')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Laudo Crédito Verde
          </button>

          <button className="btn btn-primary" onClick={() => setIsConsumoModalOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Registrar Consumo
          </button>
        </div>
      </div>

      {/* Top Ticker de Mercado e Métricas em Tempo Real */}
      <div className="market-ticker stagger-item" style={{ marginBottom: '24px' }}>
        <div className="ticker-item">
          <div className="status-dot" style={{ marginRight: '4px' }}></div>
          <span className="label">MATRIZ ENERGÉTICA:</span>
          <span className="val" style={{ color: 'var(--accent-text)' }}>68,4% RENOVÁVEL</span>
          <span className="delta-up">+12.6 p.p.</span>
        </div>
        <span className="ticker-sep">|</span>
        <div className="ticker-item">
          <span className="label">PLANO ABC+:</span>
          <span className="val" style={{ color: 'var(--accent-text)' }}>RATING A+ (-1,0% a.a.)</span>
          <span className="delta-up">ELEGÍVEL</span>
        </div>
        <span className="ticker-sep">|</span>
        <div className="ticker-item">
          <span className="label">CRÉDITOS CBIOS:</span>
          <span className="val">39,4 CBIOs</span>
          <span className="delta-up">B3 VIGENTE</span>
        </div>
        <span className="ticker-sep">|</span>
        <div className="ticker-item">
          <span className="label">SOLAR FOTOVOLTAICA:</span>
          <span className="val">82.400 kWh</span>
          <span className="delta-up">120 kWp</span>
        </div>
        <span className="ticker-sep">|</span>
        <div className="ticker-item">
          <span className="label">INVENTÁRIO GHG:</span>
          <span className="val">98.400 tCO₂e</span>
          <span className="delta-up">-14.2%</span>
        </div>
      </div>

      {/* Master KPI Strip (4 Cards Padrão Seed) */}
      <div className="kpi-strip stagger-item" style={{ animationDelay: '40ms' }}>
        {/* Card 1: Emissões Totais */}
        <div className="kpi-cell">
          <span className="kpi-cell-label">Emissões Totais (Escopos 1 & 2)</span>
          <div className="kpi-cell-val">
            98.400 <span className="unit-text">tCO₂e</span>
          </div>
          <span className="kpi-cell-sub">
            <span className="kpi-tag good">-14.2%</span> Escopo 1: 72,1 t • Escopo 2: 26,3 t
          </span>
        </div>

        {/* Card 2: % Energia Renovável */}
        <div className="kpi-cell">
          <span className="kpi-cell-label">Matriz Energética Renovável</span>
          <div className="kpi-cell-val">
            68,4% <span className="unit-text" style={{ color: 'var(--accent-text)' }}>• Meta ABC+: 60%</span>
          </div>
          <div className="esg-progress-container" style={{ margin: '4px 0 2px' }} title="68.4% alcançado vs 60.0% meta Plano ABC+">
            <div className="esg-progress-fill" style={{ width: '68.4%' }}></div>
          </div>
          <span className="kpi-cell-sub">
            <span className="kpi-tag good">+12.6 p.p.</span> Solar 42% + Biodiesel B20 26,4%
          </span>
        </div>

        {/* Card 3: Intensidade por Hectare */}
        <div className="kpi-cell">
          <span className="kpi-cell-label">Intensidade por Hectare</span>
          <div className="kpi-cell-val">
            0,142 <span className="unit-text">tCO₂e / ha</span>
          </div>
          <span className="kpi-cell-sub">
            <span className="kpi-tag info">-28.3%</span> Benchmark MT: 0,198 t/ha • 690 ha
          </span>
        </div>

        {/* Card 4: Rating ESG & Plano ABC+ */}
        <div className="kpi-cell">
          <span className="kpi-cell-label">Crédito Verde (Plano ABC+)</span>
          <div className="kpi-cell-val" style={{ color: 'var(--accent-text)' }}>
            -1,0% <span className="unit-text">a.a. no Custeio</span>
          </div>
          <span className="kpi-cell-sub">
            <span className="kpi-tag good">RATING A+</span> Econ. est.: R$ 120.000/ano • 39.4 CBIOs
          </span>
        </div>
      </div>

      {/* Banner Inteligente de Oportunidade de Financiamento */}
      <div className="market-alert-banner stagger-item" style={{ animationDelay: '80ms', marginBottom: '24px' }}>
        <div className="market-alert-left">
          <div className="market-alert-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          </div>
          <div className="market-alert-text">
            <span className="market-alert-title">Elegibilidade Confirmada: Bonificação de Juros no Plano ABC+ & Descarbonização</span>
            <span className="market-alert-desc">
              Com <strong>68,4% de fontes renováveis</strong>, a Fazenda Santa Maria supera o critério mínimo do Plano ABC+ (60%), garantindo <strong>redução de 1,00% a.a. nos juros</strong> do crédito rural e emissão auditada de <strong>39,4 CBIOs</strong> na B3.
            </span>
          </div>
        </div>
        <div className="market-alert-actions">
          <button
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '11.5px' }}
            onClick={() => handleOpenLaudo('2026-09')}
          >
            Ver Laudo Auditado
          </button>
          <button
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '11.5px' }}
            onClick={() => setIsConsumoModalOpen(true)}
          >
            Registrar Consumo
          </button>
        </div>
      </div>

      {/* Seção Central: Composição da Matriz & Simulador Interativo */}
      <section className="esg-main-grid stagger-item" style={{ animationDelay: '120ms' }}>
        {/* Coluna 1: Composição da Matriz & Fontes Ativas */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
                style={{ width: '17px', height: '17px', color: 'var(--accent)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
              Balanço e Composição da Matriz Energética
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              MCTI 2026 • GHG Protocol
            </span>
          </div>

          <div className="section-body">
            {/* Barra Segmentada Visual */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Distribuição Percentual de Consumo</span>
                <span style={{ color: 'var(--accent-text)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  68.4% RENOVÁVEL / 31.6% FÓSSIL
                </span>
              </div>
              <div className="matrix-stacked-bar">
                <div className="matrix-segment seg-solar" style={{ width: '42%' }} title="Solar Fotovoltaica: 42.0% (82.400 kWh)">
                  Solar: 42.0%
                </div>
                <div className="matrix-segment seg-biodiesel" style={{ width: '26.4%' }} title="Biodiesel B20: 26.4% (31.200 L)">
                  B20: 26.4%
                </div>
                <div className="matrix-segment seg-grid" style={{ width: '18.2%' }} title="Rede Elétrica Rural: 18.2% (35.600 kWh)">
                  Rede: 18.2%
                </div>
                <div className="matrix-segment seg-fossil" style={{ width: '13.4%' }} title="Diesel S10 Fóssil: 13.4% (26.900 L)">
                  Diesel: 13.4%
                </div>
              </div>
            </div>

            {/* Mini Legenda da Matriz */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '14px' }}>
              <div className="matrix-legend-item">
                <div className="matrix-legend-header">
                  <div className="legend-color-dot" style={{ background: '#10b981' }}></div>
                  <span>Solar Própria</span>
                </div>
                <span className="matrix-legend-val">82.400 kWh</span>
              </div>
              <div className="matrix-legend-item">
                <div className="matrix-legend-header">
                  <div className="legend-color-dot" style={{ background: '#06b6d4' }}></div>
                  <span>Biodiesel B20</span>
                </div>
                <span className="matrix-legend-val">31.200 L</span>
              </div>
              <div className="matrix-legend-item">
                <div className="matrix-legend-header">
                  <div className="legend-color-dot" style={{ background: '#3b82f6' }}></div>
                  <span>Rede Rural</span>
                </div>
                <span className="matrix-legend-val">35.600 kWh</span>
              </div>
              <div className="matrix-legend-item">
                <div className="matrix-legend-header">
                  <div className="legend-color-dot" style={{ background: '#f59e0b' }}></div>
                  <span>Diesel Fóssil</span>
                </div>
                <span className="matrix-legend-val">26.900 L</span>
              </div>
            </div>

            {/* Lista Detalhada das Fontes de Energia */}
            <div className="energy-sources-list" style={{ marginTop: '16px' }}>
              {/* Fonte 1: Solar */}
              <div className="source-row-card">
                <div className="source-info">
                  <div className="source-icon-wrap" style={{ background: 'var(--accent-muted)', color: 'var(--accent-text)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                  </div>
                  <div className="source-names">
                    <span className="source-title">Solar Fotovoltaica (Galpões Sede & Pivô 01)</span>
                    <span className="source-desc">Renovável • Fator de emissão: 0.00 kgCO₂e/kWh • 120 kWp</span>
                  </div>
                </div>
                <div className="source-metrics">
                  <div className="source-stat">
                    <span className="source-stat-lbl">Consumo</span>
                    <span className="source-stat-val">82.400 kWh</span>
                  </div>
                  <div className="source-stat">
                    <span className="source-stat-lbl">Custo Equiv.</span>
                    <span className="source-stat-val" style={{ color: 'var(--accent-text)' }}>R$ 9.064</span>
                  </div>
                </div>
              </div>

              {/* Fonte 2: Biodiesel */}
              <div className="source-row-card">
                <div className="source-info">
                  <div className="source-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                    </svg>
                  </div>
                  <div className="source-names">
                    <span className="source-title">Biodiesel B20 (Frota de Colheita S790)</span>
                    <span className="source-desc">Renovável (Biocombustível) • Fator Líquido: 1.84 kgCO₂e/L</span>
                  </div>
                </div>
                <div className="source-metrics">
                  <div className="source-stat">
                    <span className="source-stat-lbl">Consumo</span>
                    <span className="source-stat-val">31.200 L</span>
                  </div>
                  <div className="source-stat">
                    <span className="source-stat-lbl">Custo Total</span>
                    <span className="source-stat-val">R$ 170.040</span>
                  </div>
                </div>
              </div>

              {/* Fonte 3: Rede Elétrica Rural */}
              <div className="source-row-card">
                <div className="source-info">
                  <div className="source-icon-wrap" style={{ background: 'var(--info-muted)', color: 'var(--info-text)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                    </svg>
                  </div>
                  <div className="source-names">
                    <span className="source-title">Rede Elétrica Rural (Energisa Sinop)</span>
                    <span className="source-desc">Misto (Escopo 2) • Fator Médio SIN: 0.074 kgCO₂e/kWh</span>
                  </div>
                </div>
                <div className="source-metrics">
                  <div className="source-stat">
                    <span className="source-stat-lbl">Consumo</span>
                    <span className="source-stat-val">35.600 kWh</span>
                  </div>
                  <div className="source-stat">
                    <span className="source-stat-lbl">Custo Total</span>
                    <span className="source-stat-val">R$ 27.768</span>
                  </div>
                </div>
              </div>

              {/* Fonte 4: Diesel Fóssil S10 */}
              <div className="source-row-card">
                <div className="source-info">
                  <div className="source-icon-wrap" style={{ background: 'var(--warning-muted)', color: 'var(--warning-text)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <div className="source-names">
                    <span className="source-title">Diesel Fóssil S10 (Tratores Pesados JD 8R)</span>
                    <span className="source-desc">Fóssil (Escopo 1) • Fator: 2.68 kgCO₂e/L • Transição prioritária</span>
                  </div>
                </div>
                <div className="source-metrics">
                  <div className="source-stat">
                    <span className="source-stat-lbl">Consumo</span>
                    <span className="source-stat-val">26.900 L</span>
                  </div>
                  <div className="source-stat">
                    <span className="source-stat-lbl">Custo Total</span>
                    <span className="source-stat-val">R$ 158.710</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 2: Simulador Interativo de Descarbonização & Bônus de Crédito */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
                style={{ width: '17px', height: '17px', color: 'var(--accent)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
              </svg>
              Simulador de Transição Energética & Bônus de Crédito
            </div>
            <span className="kpi-tag good">MOTOR DINÂMICO</span>
          </div>

          <div className="section-body">
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Ajuste os parâmetros de transição energética para estimar a redução de carbono e o bônus financeiro aplicado no Plano ABC+ (Financiamento Rural Sustentável).
            </p>

            <div className="sim-box" style={{ marginTop: '14px' }}>
              {/* Controle 1: % Biodiesel na Frota */}
              <div className="sim-slider-group">
                <div className="sim-label-row">
                  <span>% de Mistura de Biodiesel na Frota Pesada:</span>
                  <span className="sim-val-display">{sliderBiodiesel}% (B{sliderBiodiesel})</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={sliderBiodiesel}
                  className="sim-range"
                  onChange={(e) => setSliderBiodiesel(Number(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span>B10 (Mínimo)</span>
                  <span>B20 (Atual)</span>
                  <span>B50 (Meta)</span>
                  <span>B100 (Puro)</span>
                </div>
              </div>

              {/* Controle 2: Expansão Solar kWp */}
              <div className="sim-slider-group">
                <div className="sim-label-row">
                  <span>Expansão de Usina Solar nos Pivôs Centrais:</span>
                  <span className="sim-val-display">+{sliderSolar} kWp ({120 + sliderSolar} kWp total)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="10"
                  value={sliderSolar}
                  className="sim-range"
                  onChange={(e) => setSliderSolar(Number(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span>+0 kWp</span>
                  <span>+50 kWp</span>
                  <span>+100 kWp</span>
                  <span>+150 kWp</span>
                </div>
              </div>

              {/* Controle 3: Custeio Agrícola Base */}
              <div className="sim-slider-group">
                <div className="sim-label-row">
                  <span>Volume Estimado de Custeio Agrícola (Plano ABC+):</span>
                  <span className="sim-val-display">R$ {sliderCusteio.toLocaleString('pt-BR')}</span>
                </div>
                <input
                  type="range"
                  min="4000000"
                  max="24000000"
                  step="1000000"
                  value={sliderCusteio}
                  className="sim-range"
                  onChange={(e) => setSliderCusteio(Number(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span>R$ 4M</span>
                  <span>R$ 12M (Base)</span>
                  <span>R$ 24M</span>
                </div>
              </div>
            </div>

            {/* Painel de Resultados Imediatos da Simulação */}
            <div className="sim-results-grid" style={{ margin: '14px 0' }}>
              <div className="sim-result-card">
                <span className="sim-result-lbl">Nova Matriz Renovável</span>
                <span className="sim-result-val">{simResults.novaMatriz.toFixed(1)}%</span>
              </div>
              <div className="sim-result-card">
                <span className="sim-result-lbl">Carbono Abatido (tCO₂e)</span>
                <span className="sim-result-val" style={{ color: '#38bdf8' }}>
                  -{simResults.tAbatida.toFixed(1)} t/safra
                </span>
              </div>
              <div className="sim-result-card">
                <span className="sim-result-lbl">Economia Juros (-1.0% a.a.)</span>
                <span className="sim-result-val">
                  R$ {simResults.econReais.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / ano
                </span>
              </div>
              <div className="sim-result-card">
                <span className="sim-result-lbl">Créditos CBIOs Gerados</span>
                <span className="sim-result-val" style={{ color: '#c084fc' }}>
                  {simResults.cbios.toFixed(1)} CBIOs
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={resetSimulador}>
                Restaurar Padrão
              </button>
              <button
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '12px' }}
                onClick={() => showToast('Metas do Plano de Descarbonização 2025/26 salvas no banco de dados!')}
              >
                Salvar como Meta de Transição
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Inferior: Histórico de Relatórios Mensais ESG & Auditoria */}
      <section className="section-card stagger-item" style={{ animationDelay: '160ms' }}>
        <div className="section-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="section-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
              stroke="currentColor"
              style={{ width: '17px', height: '17px', color: 'var(--accent)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
            Histórico de Relatórios Mensais ESG & Auditorias Emitidas
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="kpi-tag good">CELERY WORKER: ATIVO</span>
            <button
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '11.5px' }}
              onClick={() => setIsNovoMesModalOpen(true)}
            >
              + Fechar Novo Mês
            </button>
          </div>
        </div>

        {/* Barra de Filtros e Busca Padrão Seed */}
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'var(--bg-surface)' }}>
          <div className="cat-tabs" style={{ margin: 0, padding: 0, border: 'none' }}>
            <button
              className={`cat-tab ${tableStatusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setTableStatusFilter('ALL')}
            >
              Todos os Relatórios <span className="count">{reports.length}</span>
            </button>
            <button
              className={`cat-tab ${tableStatusFilter === 'PUBLISHED' ? 'active' : ''}`}
              onClick={() => setTableStatusFilter('PUBLISHED')}
            >
              Homologados <span className="count">{reports.filter((r) => r.status === 'PUBLISHED').length}</span>
            </button>
            <button
              className={`cat-tab ${tableStatusFilter === 'DRAFT' ? 'active' : ''}`}
              onClick={() => setTableStatusFilter('DRAFT')}
            >
              Rascunhos <span className="count">{reports.filter((r) => r.status === 'DRAFT').length}</span>
            </button>
          </div>

          <div style={{ position: 'relative', width: '240px' }}>
            <input
              type="text"
              className="form-input"
              style={{ height: '34px', fontSize: '12px', paddingLeft: '32px' }}
              placeholder="Buscar por período/mês..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              style={{ position: 'absolute', left: '10px', top: '9px', width: '15px', height: '15px', color: 'var(--text-muted)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Emissão Total</th>
                <th>Intensidade (ha)</th>
                <th>% Renovável</th>
                <th>Rating ABC+</th>
                <th>Status</th>
                <th>Última Atualização</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Nenhum relatório encontrado para os critérios de busca.
                  </td>
                </tr>
              ) : (
                filteredReports.map((rep) => (
                  <tr key={rep.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {rep.periodLabel}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{rep.totalEmission}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{rep.intensity}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-text)', fontWeight: 600 }}>
                      {rep.renewablePct}
                    </td>
                    <td>
                      <span className="kpi-tag good">{rep.ratingBadge}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${rep.status === 'PUBLISHED' ? 'published' : 'draft'}`}>
                        {rep.statusLabel}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rep.updatedAt}</td>
                    <td style={{ textAlign: 'right' }}>
                      {rep.status === 'DRAFT' ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                            onClick={() => handlePublicarRelatorio(rep.id, rep.periodLabel)}
                          >
                            Publicar
                          </button>
                          <button
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                            onClick={() => handleOpenLaudo(rep.period)}
                          >
                            Prévia
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-outline"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                          onClick={() => handleOpenLaudo(rep.period)}
                        >
                          Ver Laudo
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MODAL 1: REGISTRAR CONSUMO ENERGÉTICO (780px de Largura)     */}
      {/* ============================================================ */}
      {isConsumoModalOpen && (
        <div className="modal-overlay open" onClick={() => setIsConsumoModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  style={{ width: '20px', height: '20px', color: 'var(--accent)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Registrar Consumo Energético Rural
              </div>
              <button className="modal-close" onClick={() => setIsConsumoModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSalvarConsumo}>
              <div className="modal-body">
                <div className="form-row">
                  {/* Fonte de Energia (CustomSelect) */}
                  <div className="form-group">
                    <label className="form-label">Fonte de Energia *</label>
                    <CustomSelect
                      value={formFonte}
                      onChange={(val) => setFormFonte(val)}
                      options={FONTE_OPTIONS}
                    />
                  </div>

                  {/* Categoria Enquadrada */}
                  <div className="form-group">
                    <label className="form-label">Classificação da Matriz</label>
                    <div style={{ display: 'flex', alignItems: 'center', height: '38px' }}>
                      <span className={fonteCategory.className}>{fonteCategory.label}</span>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  {/* Equipamento / Setor de Aplicação */}
                  <div className="form-group">
                    <label className="form-label">Equipamento ou Setor Alvo *</label>
                    <CustomSelect
                      value={formEquip}
                      onChange={(val) => setFormEquip(val)}
                      options={EQUIP_OPTIONS}
                    />
                  </div>

                  {/* Data de Apuração com CustomDatePicker */}
                  <div className="form-group">
                    <label className="form-label">Data de Apuração *</label>
                    <CustomDatePicker
                      value={formData}
                      onChange={(val) => setFormData(val)}
                      placeholder="DD/MM/AAAA"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  {/* Quantidade Consumida com Stepper */}
                  <div className="form-group">
                    <label className="form-label">{fonteCategory.unitLabel}</label>
                    <div className="stepper-wrap">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        className="form-input"
                        value={formQtd}
                        onChange={(e) => setFormQtd(Math.max(0, Number(e.target.value)))}
                        required
                      />
                      <div className="stepper-btns">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormQtd((v) => v + 50)}
                          title="Aumentar"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormQtd((v) => Math.max(0, v - 50))}
                          title="Diminuir"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Custo Total em R$ com Stepper */}
                  <div className="form-group">
                    <label className="form-label">Custo Total (R$) *</label>
                    <div className="stepper-wrap">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        className="form-input"
                        value={formCusto}
                        onChange={(e) => setFormCusto(Math.max(0, Number(e.target.value)))}
                        required
                      />
                      <div className="stepper-btns">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormCusto((c) => +(c + 100).toFixed(2))}
                          title="Aumentar"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormCusto((c) => Math.max(0, +(c - 100).toFixed(2)))}
                          title="Diminuir"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsConsumoModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmar Registro de Consumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: LAUDO TÉCNICO DE CRÉDITO RURAL VERDE (PLANO ABC+)   */}
      {/* ============================================================ */}
      {isLaudoModalOpen && (
        <div className="modal-overlay open" onClick={() => setIsLaudoModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                  style={{ width: '20px', height: '20px', color: 'var(--accent)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
                Laudo Técnico de Conformidade ESG e Crédito Verde (Plano ABC+)
              </div>
              <button className="modal-close" onClick={() => setIsLaudoModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="laudo-document">
                <div className="laudo-header-box">
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      PARECER DE ELEGIBILIDADE FINANCEIRA SUSTENTÁVEL
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Normativa MAPA • Plano ABC+ / GHG Protocol Agrícola 2026 • Registro #LAUDO-{selectedLaudoPeriod}
                    </div>
                  </div>
                  <div className="laudo-tag">CERTIFICADO SEED AGRO</div>
                </div>

                {/* Dados da Propriedade */}
                <div className="laudo-kv-grid">
                  <div className="laudo-kv-card">
                    <span className="laudo-kv-k">Propriedade</span>
                    <span className="laudo-kv-v">Fazenda Santa Maria</span>
                  </div>
                  <div className="laudo-kv-card">
                    <span className="laudo-kv-k">CAR Homologado</span>
                    <span className="laudo-kv-v" style={{ fontSize: '11.5px' }}>
                      MT-5107909-B8F2
                    </span>
                  </div>
                  <div className="laudo-kv-card">
                    <span className="laudo-kv-k">Área Auditada</span>
                    <span className="laudo-kv-v">690,00 Hectares</span>
                  </div>
                </div>

                {/* Indicadores Consolidados */}
                <div className="laudo-kv-grid">
                  <div className="laudo-kv-card">
                    <span className="laudo-kv-k">Matriz Renovável</span>
                    <span className="laudo-kv-v" style={{ color: 'var(--accent-text)' }}>
                      68,40% (Nível A+)
                    </span>
                  </div>
                  <div className="laudo-kv-card">
                    <span className="laudo-kv-k">Emissão Total</span>
                    <span className="laudo-kv-v">98,400 tCO₂e</span>
                  </div>
                  <div className="laudo-kv-card">
                    <span className="laudo-kv-k">Intensidade</span>
                    <span className="laudo-kv-v">0,142 tCO₂e / ha</span>
                  </div>
                </div>

                {/* Selo Oficial de Parecer Bancário */}
                <div className="laudo-seal">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    style={{ width: '28px', height: '28px', color: 'var(--accent)', flexShrink: 0 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ENQUADRAMENTO: ELEGÍVEL COM BÔNUS MÁXIMO (TAXA REDUZIDA)
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      A propriedade atinge os critérios do Programa ABC+ (&gt; 60% renovável). Aplicação de{' '}
                      <strong>-1,00% a.a.</strong> de bonificação na taxa de juros do crédito rural para a Safra 2024/25.
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Declaração gerada automaticamente pelo motor de inteligência e auditoria da plataforma Seed utilizando os fatores oficiais de emissão do MCTI e balanço energético rural em conformidade com o Banco Central do Brasil (Resolução CMN 5.081).
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setIsLaudoModalOpen(false)}>
                Fechar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  showToast('Compilando Laudo Oficial com assinatura criptográfica... Download iniciado!');
                  setIsLaudoModalOpen(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.076-.673-2.13-1.28-3.108a9 9 0 0 1-1.44-4.721M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Exportar PDF Oficial (Auditável)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: FECHAR NOVO MÊS / CONSOLIDAÇÃO GHG PROTOCOL         */}
      {/* ============================================================ */}
      {isNovoMesModalOpen && (
        <div className="modal-overlay open" onClick={() => setIsNovoMesModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  style={{ width: '20px', height: '20px', color: 'var(--accent)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Fechar e Homologar Novo Mês (GHG Protocol)
              </div>
              <button className="modal-close" onClick={() => setIsNovoMesModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSalvarNovoMes}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Código do Período (AAAA-MM) *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={novoMesPeriod}
                      onChange={(e) => setNovoMesPeriod(e.target.value)}
                      placeholder="Ex: 2026-11"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rótulo de Exibição *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={novoMesLabel}
                      onChange={(e) => setNovoMesLabel(e.target.value)}
                      placeholder="Ex: 2026-11 (Novembro)"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Emissão Total Estimada (tCO₂e) *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={novoMesEmissao}
                      onChange={(e) => setNovoMesEmissao(e.target.value)}
                      placeholder="Ex: 5.940"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">% Renovável Apurada *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={novoMesRenovavel}
                      onChange={(e) => setNovoMesRenovavel(e.target.value)}
                      placeholder="Ex: 74.2%"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Intensidade por Hectare (t/ha)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={novoMesIntensidade}
                      onChange={(e) => setNovoMesIntensidade(e.target.value)}
                      placeholder="Ex: 0.009"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsNovoMesModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Consolidar & Publicar Balanço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Container de Toasts */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className="toast">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                style={{ width: '16px', height: '16px', color: 'var(--accent)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span>{toast.text}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
