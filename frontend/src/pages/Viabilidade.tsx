import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CustomSelect } from '../components/ui/CustomSelect';
import { CustomDatePicker } from '../components/ui/CustomDatePicker';
import { operacionalService } from '../services/operacionalService';

interface HedgeContract {
  id: string;
  code: string;
  buyer: string;
  buyerUnit: string;
  volume: number;
  price: number;
  modality: string;
  dueDate: string;
  status: 'EXECUTED' | 'ACTIVE' | 'OPEN';
  statusLabel: string;
}

interface TalhaoBreakevenItem {
  id: string;
  name: string;
  area: string;
  cotPerHa: number;
  breakevenYield: number;
  estYield: number;
  netPerHa: number;
}

interface ToastMessage {
  id: string;
  text: string;
}

const INITIAL_CONTRACTS: HedgeContract[] = [
  {
    id: '1',
    code: 'CTR-2025-01',
    buyer: 'Cargill Agrícola',
    buyerUnit: 'Unidade Sorriso / MT',
    volume: 45000,
    price: 140.0,
    modality: 'Barter Adubo (Fosfatados)',
    dueDate: '30/03/2025',
    status: 'EXECUTED',
    statusLabel: 'Quitado / Entregue',
  },
  {
    id: '2',
    code: 'CTR-2025-02',
    buyer: 'Bunge Brasil',
    buyerUnit: 'Porto Paranaguá CIF',
    volume: 60000,
    price: 138.5,
    modality: 'Venda a Termo (Preço Fechado)',
    dueDate: '15/04/2025',
    status: 'ACTIVE',
    statusLabel: 'Contrato Ativo',
  },
  {
    id: '3',
    code: 'CTR-2025-03',
    buyer: 'Amaggi Exportação',
    buyerUnit: 'Terminal Fluvial Miritituba',
    volume: 30000,
    price: 136.0,
    modality: 'Hedge Sintético B3 (Opções Put)',
    dueDate: '30/05/2025',
    status: 'ACTIVE',
    statusLabel: 'Travado com Put',
  },
  {
    id: '4',
    code: 'CTR-SPOT-01',
    buyer: 'Armazém Próprio (Silo 02)',
    buyerUnit: 'Disponível p/ Comercialização',
    volume: 75000,
    price: 141.8,
    modality: 'Mercado Físico Spot',
    dueDate: 'Pós-Colheita',
    status: 'OPEN',
    statusLabel: 'Aguardando Preço',
  },
];

const TALHOES_BREAKEVEN: TalhaoBreakevenItem[] = [
  {
    id: 't1',
    name: 'Talhão 01',
    area: '120 ha',
    cotPerHa: 4050,
    breakevenYield: 29.3,
    estYield: 72,
    netPerHa: 5886,
  },
  {
    id: 't2',
    name: 'Talhão 02',
    area: '140 ha (Pivô)',
    cotPerHa: 4380,
    breakevenYield: 31.7,
    estYield: 78,
    netPerHa: 6384,
  },
  {
    id: 't3',
    name: 'Talhão 03',
    area: '95 ha',
    cotPerHa: 3980,
    breakevenYield: 28.8,
    estYield: 65,
    netPerHa: 4990,
  },
  {
    id: 't4',
    name: 'Talhão 04',
    area: '160 ha',
    cotPerHa: 4220,
    breakevenYield: 30.5,
    estYield: 68,
    netPerHa: 5164,
  },
  {
    id: 't5',
    name: 'Talhão 05',
    area: '110 ha',
    cotPerHa: 4100,
    breakevenYield: 29.7,
    estYield: 67,
    netPerHa: 5146,
  },
];

const TRADING_OPTIONS = [
  { value: 'Cargill Agrícola (Sorriso / MT)', label: 'Cargill Agrícola (Sorriso / MT)' },
  { value: 'Bunge Brasil (CIF Paranaguá)', label: 'Bunge Brasil (CIF Paranaguá)' },
  { value: 'Amaggi Exportação (Miritituba)', label: 'Amaggi Exportação (Miritituba)' },
  { value: 'ADM do Brasil (Santos FOB)', label: 'ADM do Brasil (Santos FOB)' },
  { value: 'Louis Dreyfus Commodities (LDC)', label: 'Louis Dreyfus Commodities (LDC)' },
  { value: 'Mercado Spot Local (Venda Física)', label: 'Mercado Spot Local (Venda Física)' },
];

const MODALITY_OPTIONS = [
  { value: 'Venda Física a Termo (Preço Fixo)', label: 'Venda Física a Termo (Preço Fixo)' },
  { value: 'Barter Insumo (Troca Adubo/Químico)', label: 'Barter Insumo (Troca Adubo/Químico)' },
  { value: 'Hedge Futuro B3 (Trava Financeira)', label: 'Hedge Futuro B3 (Trava Financeira)' },
  { value: 'Opção de Venda (Put B3 / CBOT)', label: 'Opção de Venda (Put B3 / CBOT)' },
];

const MATRIX_PRICES = [120, 128, 135, 142, 150, 160];
const MATRIX_YIELDS = [58, 62, 66, 70, 74, 78];

export const Viabilidade: React.FC = () => {
  // Parâmetros da Simulação de Sensibilidade
  const [yieldVal, setYieldVal] = useState<number>(68);
  const [priceVal, setPriceVal] = useState<number>(138);
  const [costVal, setCostVal] = useState<number>(4135);
  const [usdVal, setUsdVal] = useState<number>(5.75);

  // Lista de Contratos
  const [contracts, setContracts] = useState<HedgeContract[]>(INITIAL_CONTRACTS);

  useEffect(() => {
    operacionalService.calcularViabilidade({
      safra_id: '00000000-0000-0000-0000-000000000001',
      custo_mao_obra: 850,
      custo_frete: 420,
      custo_impostos: 280,
      preco_mercado_saca: priceVal,
    }).then((res) => {
      if (res && res.custo_por_saca) {
        console.info('Cálculo de viabilidade via API executado com sucesso:', res);
      }
    }).catch((err) => {
      console.info('Modo demonstração ativo em Viabilidade Econômica:', err);
    });
  }, [priceVal]);

  // Modais
  const [isHedgeModalOpen, setIsHedgeModalOpen] = useState<boolean>(false);
  const [isTalhaoModalOpen, setIsTalhaoModalOpen] = useState<boolean>(false);

  // Estados de exportação do DRE
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingXlsx, setIsExportingXlsx] = useState<boolean>(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);

  const handleExportDrePdf = async () => {
    setShowExportMenu(false);
    setIsExportingPdf(true);
    showToast('Gerando Demonstração de Resultado do Exercício (DRE) em PDF oficial...');
    try {
      await operacionalService.exportarDrePdf('Soja');
      showToast('DRE oficial em PDF baixado com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar DRE em PDF. Verifique a conexão com o servidor.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDreXlsx = async () => {
    setShowExportMenu(false);
    setIsExportingXlsx(true);
    showToast('Gerando planilha contábil DRE em formato Excel (.xlsx)...');
    try {
      await operacionalService.exportarDreXlsx('Soja');
      showToast('Planilha DRE Excel baixada com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar DRE em Excel. Verifique a conexão com o servidor.');
    } finally {
      setIsExportingXlsx(false);
    }
  };

  // Formulário do Modal de Hedge
  const [formTrading, setFormTrading] = useState<string>('Cargill Agrícola (Sorriso / MT)');
  const [formVolume, setFormVolume] = useState<number>(15000);
  const [formPrice, setFormPrice] = useState<number>(141.8);
  const [formModality, setFormModality] = useState<string>('Venda Física a Termo (Preço Fixo)');
  const [formDueDate, setFormDueDate] = useState<string>('2025-04-30');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Cálculos Econômicos Vivos
  const grossPerHa = yieldVal * priceVal;
  const netPerHa = grossPerHa - costVal;
  const marginPct = (netPerHa / grossPerHa) * 100;
  const beYield = costVal / priceVal;
  const bePrice = costVal / yieldVal;

  // Status Tag do Cenário
  const scenarioTag = useMemo(() => {
    if (netPerHa >= 3500) {
      return { label: 'ALTAMENTE VIÁVEL', className: 'kpi-tag good' };
    } else if (netPerHa >= 1500) {
      return { label: 'MODERADO', className: 'kpi-tag info' };
    } else if (netPerHa >= 0) {
      return { label: 'BREAKEVEN JUSTO', className: 'kpi-tag warn' };
    } else {
      return { label: 'CENÁRIO DEFICITÁRIO', className: 'kpi-tag danger' };
    }
  }, [netPerHa]);

  // Manipuladores de Sliders
  const handleUsdChange = (val: number) => {
    setUsdVal(val);
    const newPrice = Math.max(110, Math.min(170, Math.round(val * 24.0)));
    setPriceVal(newPrice);
  };

  const handlePriceChange = (val: number) => {
    setPriceVal(val);
    const implUsd = +(val / 24.0).toFixed(2);
    if (implUsd >= 4.8 && implUsd <= 6.5) {
      setUsdVal(implUsd);
    }
  };

  const handleReset = () => {
    setYieldVal(68);
    setPriceVal(138);
    setCostVal(4135);
    setUsdVal(5.75);
    showToast('Parâmetros da simulação restaurados para a safra base.');
  };

  // Progresso do Hedge
  const hedgeStats = useMemo(() => {
    const lockedVolume = contracts
      .filter((c) => c.status === 'EXECUTED' || c.status === 'ACTIVE')
      .reduce((acc, c) => acc + c.volume, 0);
    const spotVolume = contracts
      .filter((c) => c.status === 'OPEN')
      .reduce((acc, c) => acc + c.volume, 0);
    const totalVolume = lockedVolume + spotVolume;
    const lockedPct = totalVolume > 0 ? (lockedVolume / totalVolume) * 100 : 0;

    const weightedSum = contracts
      .filter((c) => c.status === 'EXECUTED' || c.status === 'ACTIVE')
      .reduce((acc, c) => acc + c.volume * c.price, 0);
    const avgPrice = lockedVolume > 0 ? weightedSum / lockedVolume : 138.5;

    return {
      lockedVolume,
      spotVolume,
      totalVolume,
      lockedPct,
      avgPrice,
    };
  }, [contracts]);

  // Célula mais próxima para destaque na Matriz de Sensibilidade
  const closestCell = useMemo(() => {
    let bestY = MATRIX_YIELDS[0];
    let bestP = MATRIX_PRICES[0];
    let minDistance = Infinity;

    for (const y of MATRIX_YIELDS) {
      for (const p of MATRIX_PRICES) {
        const dist = Math.abs(y - yieldVal) + Math.abs(p - priceVal) / 3;
        if (dist < minDistance) {
          minDistance = dist;
          bestY = y;
          bestP = p;
        }
      }
    }
    return { y: bestY, p: bestP };
  }, [yieldVal, priceVal]);

  // Abertura com Parâmetros Pré-definidos
  const handleOpenArbitrage = () => {
    setFormTrading('Cargill Agrícola (Sorriso / MT)');
    setFormVolume(15000);
    setFormPrice(141.8);
    setFormModality('Venda Física a Termo (Preço Fixo)');
    setIsHedgeModalOpen(true);
  };

  // Submissão do Modal de Hedge
  const handleCreateHedge = (e: React.FormEvent) => {
    e.preventDefault();
    const newContract: HedgeContract = {
      id: Math.random().toString(36).substring(2, 9),
      code: `CTR-${new Date().getFullYear()}-0${contracts.length + 1}`,
      buyer: formTrading.split('(')[0].trim(),
      buyerUnit: formTrading.includes('(')
        ? formTrading.substring(formTrading.indexOf('(') + 1, formTrading.lastIndexOf(')'))
        : 'Terminal Centro-Oeste',
      volume: formVolume,
      price: formPrice,
      modality: formModality,
      dueDate: formDueDate.split('-').reverse().join('/'),
      status: 'ACTIVE',
      statusLabel: 'Contrato Ativo',
    };

    setContracts((prev) => [newContract, ...prev]);
    setIsHedgeModalOpen(false);
    showToast(
      `Contrato de Hedge registrado com sucesso: ${newContract.buyer} • ${newContract.volume.toLocaleString('pt-BR')} sc @ R$ ${newContract.price.toFixed(2).replace('.', ',')}/sc`
    );
  };

  return (
    <>
      {/* Page Header Padrão Seed */}
      <div className="page-header">
        <div>
          <h1 className="page-heading">Viabilidade Econômica & Comercialização</h1>
          <p className="page-subheading">
            Modelagem de sensibilidade financeira, margem EBITDA, ponto de equilíbrio e gestão de travas de hedge
          </p>
        </div>

        <div className="header-actions">
          <div ref={exportMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExportingPdf || isExportingXlsx}
              aria-haspopup="true"
              aria-expanded={showExportMenu}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>{isExportingPdf ? 'Gerando PDF...' : isExportingXlsx ? 'Exportando...' : 'Exportar DRE'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '12px', height: '12px', marginLeft: '2px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {showExportMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                    right: 0,
                    width: '270px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg, 0 10px 25px -5px rgba(0,0,0,0.3))',
                    padding: '8px',
                    zIndex: 999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <button
                    type="button"
                    onClick={handleExportDrePdf}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '13px',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '20px', height: '20px', color: '#ef4444', flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <div>
                      <div style={{ fontWeight: 600 }}>Laudo Técnico DRE (PDF)</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Demonstrativo contábil e margens</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportDreXlsx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '13px',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '20px', height: '20px', color: '#10b981', flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <div>
                      <div style={{ fontWeight: 600 }}>Planilha Contábil (.XLSX)</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cenários e sensibilidade</div>
                    </div>
                  </button>
                </div>
            )}
          </div>

          <button className="btn btn-outline" onClick={() => setIsTalhaoModalOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.25 2.25L15 7.5" />
            </svg>
            Breakeven por Talhão
          </button>

          <button className="btn btn-primary" onClick={() => setIsHedgeModalOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Simular Contrato Hedge
          </button>
        </div>
      </div>

      {/* Top Ticker de Mercado em Tempo Real */}
      <div className="market-ticker" style={{ marginBottom: '24px' }}>
        <div className="ticker-item">
          <span className="label">SOJA CBOT:</span>
          <span className="val">US$ 10,24/bu</span>
          <span className="delta-up">+0.8%</span>
        </div>
        <span className="ticker-sep">|</span>
        <div className="ticker-item">
          <span className="label">MILHO B3:</span>
          <span className="val">R$ 64,20/sc</span>
          <span className="delta-up">+1.1%</span>
        </div>
        <span className="ticker-sep">|</span>
        <div className="ticker-item">
          <span className="label">DÓLAR PTAX:</span>
          <span className="val">R$ 5,742</span>
          <span className="delta-down">-0.3%</span>
        </div>
        <span className="ticker-sep">|</span>
        <div className="ticker-item">
          <span className="label">PRÊMIO PNG:</span>
          <span className="val" style={{ color: 'var(--accent-text)' }}>+115 ¢/bu</span>
        </div>
      </div>

      {/* Master Financial KPIs Bar (4 Cards) */}
      <div className="kpi-bar">
        {/* KPI 1 */}
        <div className="kpi-cell">
          <div className="kpi-cell-top">
            <span className="kpi-cell-label">Receita Bruta Projetada</span>
            <span className="kpi-tag good">+5.8% META</span>
          </div>
          <div className="kpi-cell-val">
            <span className="curr">R$</span>21.480.000<span className="decimals">,00</span>
          </div>
          <div className="kpi-cell-sub">
            <span>Safra 2024/25 • 3.200 ha (Soja + Milho)</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="kpi-cell">
          <div className="kpi-cell-top">
            <span className="kpi-cell-label">Margem EBITDA Agrícola</span>
            <span className="kpi-tag good">+3.2 p.p.</span>
          </div>
          <div className="kpi-cell-val">
            38,4%
            <span className="unit">R$ 8.248.320,00</span>
          </div>
          <div className="kpi-cell-sub">
            <span>Margem líquida após COT e fixos</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="kpi-cell">
          <div className="kpi-cell-top">
            <span className="kpi-cell-label">Custo Operacional Total (COT)</span>
            <span className="kpi-tag info">PLANEJADO</span>
          </div>
          <div className="kpi-cell-val">
            <span className="curr">R$</span>4.135<span className="decimals">,00</span>
            <span className="unit">/ ha</span>
          </div>
          <div className="kpi-cell-sub">
            <span>Insumos 54% • Frotas 21% • Fixos 25%</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="kpi-cell">
          <div className="kpi-cell-top">
            <span className="kpi-cell-label">Comercialização Travada (Hedge)</span>
            <span className="kpi-tag good">{hedgeStats.lockedPct.toFixed(1).replace('.', ',')}% FIXADO</span>
          </div>
          <div className="kpi-cell-val">
            {hedgeStats.lockedVolume.toLocaleString('pt-BR')}
            <span className="unit">sacas</span>
          </div>
          <div className="kpi-cell-sub">
            <span>
              Preço Médio Ponderado: <strong>R$ {hedgeStats.avgPrice.toFixed(2).replace('.', ',')} / sc</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Banner Inteligente de Oportunidade de Mercado */}
      <div className="market-alert-banner">
        <div className="market-alert-left">
          <div className="market-alert-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          </div>
          <div className="market-alert-text">
            <span className="market-alert-title">Oportunidade de Arbitragem & Fixação de Margem</span>
            <span className="market-alert-desc">
              A alta na CBOT (+0.8%) e dólar em R$ 5,74 elevaram a paridade de exportação em Paranaguá para{' '}
              <strong>R$ 141,80 / saca</strong> (+R$ 3,30 acima do preço médio contratado). Recomendado fixar mais 15.000 sacas para atingir 70% de cobertura pré-colheita.
            </span>
          </div>
        </div>
        <div className="market-alert-actions">
          <button
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '11.5px' }}
            onClick={() => showToast('Abrindo monitor de paridade cambial Paranaguá...')}
          >
            Ver Paridade
          </button>
          <button
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '11.5px' }}
            onClick={handleOpenArbitrage}
          >
            Fixar Lote Agora
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SEÇÃO 1: SIMULADOR PROFUNDO DE SENSIBILIDADE FINANCEIRA      */}
      {/* ============================================================ */}
      <div className="sim-card">
        <div className="sim-card-header">
          <div className="sim-header-titles">
            <div className="sim-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                style={{ width: '17px', height: '17px', color: 'var(--accent)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              Simulador Profundo de Sensibilidade Financeira
            </div>
            <div className="sim-subtitle">
              Modelagem em tempo real de preço, produtividade, custo operacional e sensibilidade da margem líquida
            </div>
          </div>
          <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '11.5px' }} onClick={handleReset}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Restaurar Padrão
          </button>
        </div>

        <div className="sim-body-layout">
          {/* Lado Esquerdo: Controles Interativos */}
          <div className="sim-controls-panel">
            {/* Controle 1: Produtividade */}
            <div className="param-group">
              <div className="param-header">
                <span className="param-label">Produtividade Esperada</span>
                <span className="param-badge-val">{yieldVal} sc/ha</span>
              </div>
              <input
                type="range"
                className="custom-range"
                min="50"
                max="85"
                step="1"
                value={yieldVal}
                onChange={(e) => setYieldVal(Number(e.target.value))}
              />
              <div className="range-limits">
                <span>50 sc/ha</span>
                <span>Média: 68</span>
                <span>85 sc/ha</span>
              </div>
            </div>

            {/* Controle 2: Preço da Saca */}
            <div className="param-group">
              <div className="param-header">
                <span className="param-label">Preço Médio de Venda</span>
                <span className="param-badge-val">R$ {priceVal.toFixed(2).replace('.', ',')} / sc</span>
              </div>
              <input
                type="range"
                className="custom-range"
                min="110"
                max="170"
                step="1"
                value={priceVal}
                onChange={(e) => handlePriceChange(Number(e.target.value))}
              />
              <div className="range-limits">
                <span>R$ 110</span>
                <span>Spot: R$ 138</span>
                <span>R$ 170</span>
              </div>
            </div>

            {/* Controle 3: Custo COT por hectare */}
            <div className="param-group">
              <div className="param-header">
                <span className="param-label">Custo Operacional (COT)</span>
                <span className="param-badge-val">R$ {costVal.toLocaleString('pt-BR')},00 / ha</span>
              </div>
              <input
                type="range"
                className="custom-range"
                min="3200"
                max="5200"
                step="50"
                value={costVal}
                onChange={(e) => setCostVal(Number(e.target.value))}
              />
              <div className="range-limits">
                <span>R$ 3.200</span>
                <span>Base: R$ 4.135</span>
                <span>R$ 5.200</span>
              </div>
            </div>

            {/* Controle 4: Dólar Câmbio */}
            <div className="param-group">
              <div className="param-header">
                <span className="param-label">Dólar Médio Projetado</span>
                <span className="param-badge-val">R$ {usdVal.toFixed(2).replace('.', ',')}</span>
              </div>
              <input
                type="range"
                className="custom-range"
                min="4.80"
                max="6.50"
                step="0.05"
                value={usdVal}
                onChange={(e) => handleUsdChange(Number(e.target.value))}
              />
              <div className="range-limits">
                <span>R$ 4,80</span>
                <span style={{ color: 'var(--accent-text)', fontWeight: 600 }}>
                  Paridade CBOT: US$ 24,00 × {usdVal.toFixed(2).replace('.', ',')} = R$ {priceVal},00
                </span>
                <span>R$ 6,50</span>
              </div>
            </div>

            {/* Card de Resultados Vivos do Cenário */}
            <div className="scenario-results-box">
              <div className="scenario-box-title">
                <span>Resultado do Cenário</span>
                <span className={scenarioTag.className}>{scenarioTag.label}</span>
              </div>

              <div className="scenario-stat-row">
                <span className="stat-name">Receita Bruta / ha:</span>
                <span className="stat-value">
                  R$ {grossPerHa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="scenario-stat-row">
                <span className="stat-name">Custo COT / ha:</span>
                <span className="stat-value">
                  R$ {costVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="scenario-stat-row">
                <span className="stat-name">Margem Líquida / ha:</span>
                <span
                  className="stat-value highlight"
                  style={{ color: netPerHa >= 0 ? 'var(--accent-text)' : 'var(--danger)' }}
                >
                  {netPerHa >= 0 ? '+R$ ' : '-R$ '}
                  {Math.abs(netPerHa).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="scenario-stat-row">
                <span className="stat-name">Margem Líquida (%):</span>
                <span
                  className="stat-value"
                  style={{
                    color:
                      marginPct >= 30
                        ? 'var(--accent-text)'
                        : marginPct >= 0
                          ? 'var(--warning)'
                          : 'var(--danger)',
                  }}
                >
                  {marginPct.toFixed(1).replace('.', ',')}%
                </span>
              </div>

              {/* Ponto de Equilíbrio (Breakeven) */}
              <div className="breakeven-indicator">
                <span className="be-label">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    style={{ width: '14px', height: '14px' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                    />
                  </svg>
                  Breakeven:
                </span>
                <span className="be-val">
                  {beYield.toFixed(1).replace('.', ',')} sc/ha (R$ {bePrice.toFixed(2).replace('.', ',')}/sc)
                </span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Matriz Bidirecional de Sensibilidade */}
          <div className="sim-matrix-panel">
            <div className="matrix-toolbar">
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Matriz de Margem Líquida (R$ / ha) — Produtividade vs. Preço
              </div>
              <div className="matrix-legend">
                <div className="legend-item">
                  <span className="legend-swatch high"></span> &gt; R$ 4.000
                </div>
                <div className="legend-item">
                  <span className="legend-swatch med"></span> R$ 2.500 a R$ 4.000
                </div>
                <div className="legend-item">
                  <span className="legend-swatch low"></span> R$ 1.000 a R$ 2.500
                </div>
                <div className="legend-item">
                  <span className="legend-swatch neg"></span> &lt; R$ 1.000 (Risco)
                </div>
              </div>
            </div>

            <div className="matrix-table-wrap">
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th className="axis-corner">Produtividade \ Preço</th>
                    {MATRIX_PRICES.map((p) => (
                      <th key={p} className="col-price">
                        R$ {p.toFixed(2).replace('.', ',')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MATRIX_YIELDS.map((y) => {
                    return (
                      <tr key={y}>
                        <td className="row-prod">{y} sc/ha</td>
                        {MATRIX_PRICES.map((p) => {
                          const net = y * p - costVal;

                          // Color termográfico
                          let colorClass = 'cell-neg';
                          if (net >= 4000) colorClass = 'cell-super';
                          else if (net >= 2500) colorClass = 'cell-high';
                          else if (net >= 1000) colorClass = 'cell-mid';
                          else if (net >= 0) colorClass = 'cell-low';

                          // Distância até o ponto ativo atual para o destaque estrela
                          const isClosest =
                            closestCell.y === y && closestCell.p === p;

                          return (
                            <td
                              key={p}
                              className={`matrix-cell ${colorClass} ${isClosest ? 'cell-current-active' : ''}`}
                              title={`Clique para simular: ${y} sc/ha @ R$ ${p}/sc`}
                              onClick={() => {
                                setYieldVal(y);
                                handlePriceChange(p);
                                showToast(`Simulando cenário: ${y} sc/ha @ R$ ${p},00/sc`);
                              }}
                            >
                              {net >= 0 ? 'R$ ' : '-R$ '}
                              {Math.abs(Math.round(net)).toLocaleString('pt-BR')}
                              {isClosest && ' ★'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <span>
                * Valores calculados com COT base de R$ {costVal.toLocaleString('pt-BR')},00/ha. Célula com borda destacada representa a aproximação do cenário ativo.
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-text)' }}>
                Margem EBITDA &gt; 35% em 88% da matriz
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SEÇÃO 2: DUAL CARDS (Contratos de Hedge & Decomposição COT)  */}
      {/* ============================================================ */}
      <div className="bottom-grid">
        {/* Bloco 1: Gestão de Contratos de Hedge & Comercialização */}
        <div className="card-block">
          <div className="card-block-header">
            <div className="card-block-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                style={{ width: '16px', height: '16px', color: 'var(--accent)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              Livro de Contratos de Comercialização & Hedge
            </div>
            <button
              className="btn btn-outline"
              style={{ padding: '4px 10px', fontSize: '11px' }}
              onClick={() => setIsHedgeModalOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Novo Contrato
            </button>
          </div>

          {/* Barra de Travamento de Safra */}
          <div className="hedge-progress-card">
            <div className="hedge-progress-top">
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Progresso de Fixação da Safra (Soja)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-text)' }}>
                {hedgeStats.lockedPct.toFixed(1).replace('.', ',')}% Concluído
              </span>
            </div>
            <div className="hedge-progress-bar-bg">
              <div className="hedge-fill-locked" style={{ width: `${Math.min(100, hedgeStats.lockedPct)}%` }}></div>
              <div className="hedge-fill-open" style={{ width: `${Math.max(0, 100 - hedgeStats.lockedPct)}%` }}></div>
            </div>
            <div className="hedge-progress-meta">
              <span>
                Fixado: <strong>{hedgeStats.lockedVolume.toLocaleString('pt-BR')} sc</strong> (Méd. R${' '}
                {hedgeStats.avgPrice.toFixed(2).replace('.', ',')})
              </span>
              <span>
                Aberto (Spot): <strong>{hedgeStats.spotVolume.toLocaleString('pt-BR')} sc</strong> (Meta R$ 142,00)
              </span>
            </div>
          </div>

          {/* Tabela de Contratos */}
          <div className="contracts-table-wrap">
            <table className="contracts-table">
              <thead>
                <tr>
                  <th>Contrato</th>
                  <th>Comprador / Trading</th>
                  <th>Volume (sc)</th>
                  <th>Preço Líquido</th>
                  <th>Modalidade</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((ctr) => {
                  let badgeClass = 'status-badge open';
                  if (ctr.status === 'EXECUTED') badgeClass = 'status-badge executed';
                  else if (ctr.status === 'ACTIVE') badgeClass = 'status-badge active';

                  return (
                    <tr key={ctr.id}>
                      <td>
                        <span className="contract-code-tag">{ctr.code}</span>
                      </td>
                      <td>
                        <div className="trading-name">{ctr.buyer}</div>
                        <div className="trading-type">{ctr.buyerUnit}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {ctr.volume.toLocaleString('pt-BR')} sc
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: ctr.status === 'OPEN' ? 'var(--text-muted)' : 'var(--accent-text)',
                          }}
                        >
                          R$ {ctr.price.toFixed(2).replace('.', ',')}
                        </span>
                      </td>
                      <td>{ctr.modality}</td>
                      <td>{ctr.dueDate}</td>
                      <td>
                        <span className={badgeClass}>{ctr.statusLabel}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bloco 2: Decomposição do COT (Custo Operacional Total) */}
        <div className="card-block">
          <div className="card-block-header">
            <div className="card-block-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                style={{ width: '16px', height: '16px', color: 'var(--info)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
              </svg>
              Composição do COT (Custo / ha)
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              Base: 3.200 ha
            </span>
          </div>

          <div className="cost-breakdown-body">
            {/* Insumo: Fertilizantes */}
            <div className="cost-item">
              <div className="cost-item-top">
                <span className="cost-item-name">Fertilizantes & Corretivos de Solo</span>
                <span className="cost-item-val">
                  R$ 1.340,00 <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(32,4%)</span>
                </span>
              </div>
              <div className="cost-bar-bg">
                <div className="cost-bar-fill" style={{ width: '32.4%', background: '#10b981' }}></div>
              </div>
            </div>

            {/* Insumo: Defensivos */}
            <div className="cost-item">
              <div className="cost-item-top">
                <span className="cost-item-name">Defensivos (Fungicidas & Herbicidas)</span>
                <span className="cost-item-val">
                  R$ 980,00 <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(23,7%)</span>
                </span>
              </div>
              <div className="cost-bar-bg">
                <div className="cost-bar-fill" style={{ width: '23.7%', background: '#3b82f6' }}></div>
              </div>
            </div>

            {/* Frotas: Combustível */}
            <div className="cost-item">
              <div className="cost-item-top">
                <span className="cost-item-name">Diesel S10 & Lubrificantes (Frotas)</span>
                <span className="cost-item-val">
                  R$ 480,00 <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(11,6%)</span>
                </span>
              </div>
              <div className="cost-bar-bg">
                <div className="cost-bar-fill" style={{ width: '11.6%', background: '#f59e0b' }}></div>
              </div>
            </div>

            {/* Insumo: Sementes */}
            <div className="cost-item">
              <div className="cost-item-top">
                <span className="cost-item-name">Sementes Certificadas (Tratamento Industrial)</span>
                <span className="cost-item-val">
                  R$ 420,00 <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(10,2%)</span>
                </span>
              </div>
              <div className="cost-bar-bg">
                <div className="cost-bar-fill" style={{ width: '10.2%', background: '#a855f7' }}></div>
              </div>
            </div>

            {/* Máquinas: Manutenção */}
            <div className="cost-item">
              <div className="cost-item-top">
                <span className="cost-item-name">Manutenção Mecânica & Peças (OS)</span>
                <span className="cost-item-val">
                  R$ 390,00 <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(9,4%)</span>
                </span>
              </div>
              <div className="cost-bar-bg">
                <div className="cost-bar-fill" style={{ width: '9.4%', background: '#06b6d4' }}></div>
              </div>
            </div>

            {/* Fixos: Mão de Obra */}
            <div className="cost-item">
              <div className="cost-item-top">
                <span className="cost-item-name">Mão de Obra, Energia & Encargos</span>
                <span className="cost-item-val">
                  R$ 525,00 <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(12,7%)</span>
                </span>
              </div>
              <div className="cost-bar-bg">
                <div className="cost-bar-fill" style={{ width: '12.7%', background: '#71717a' }}></div>
              </div>
            </div>

            {/* Resumo Totalizador */}
            <div className="cost-total-summary">
              <div>
                <div className="cost-total-label">Custo Operacional Total (COT)</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Investimento consolidado por hectare</div>
              </div>
              <div className="cost-total-val" style={{ color: 'var(--accent-text)' }}>
                R$ {costVal.toLocaleString('pt-BR')},00{' '}
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>/ ha</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: SIMULAR CONTRATO DE HEDGE / BARTER                  */}
      {/* ============================================================ */}
      {isHedgeModalOpen && (
        <div className="modal-overlay open" onClick={() => setIsHedgeModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Simular Novo Contrato de Hedge / Comercialização</div>
              <button className="modal-close" onClick={() => setIsHedgeModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateHedge}>
              <div className="modal-body">
                {/* Comprador / Trading */}
                <div className="form-group">
                  <label className="form-label">Comprador / Trading Destino</label>
                  <CustomSelect
                    value={formTrading}
                    onChange={(val) => setFormTrading(val)}
                    options={TRADING_OPTIONS}
                  />
                </div>

                <div className="form-row">
                  {/* Volume em Sacas */}
                  <div className="form-group">
                    <label className="form-label">Volume Negociado (sacas 60kg)</label>
                    <div className="stepper-wrap">
                      <input
                        type="number"
                        step="1000"
                        className="form-input"
                        value={formVolume}
                        onChange={(e) => setFormVolume(Math.max(0, Number(e.target.value)))}
                        required
                      />
                      <div className="stepper-btns">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormVolume((v) => v + 1000)}
                          title="Aumentar"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormVolume((v) => Math.max(0, v - 1000))}
                          title="Diminuir"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preço Negociado R$/sc */}
                  <div className="form-group">
                    <label className="form-label">Preço Fechado (R$ / saca)</label>
                    <div className="stepper-wrap">
                      <input
                        type="number"
                        step="0.50"
                        className="form-input"
                        value={formPrice}
                        onChange={(e) => setFormPrice(Math.max(0, Number(e.target.value)))}
                        required
                      />
                      <div className="stepper-btns">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormPrice((p) => +(p + 0.5).toFixed(2))}
                          title="Aumentar"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormPrice((p) => Math.max(0, +(p - 0.5).toFixed(2)))}
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

                <div className="form-row">
                  {/* Modalidade */}
                  <div className="form-group">
                    <label className="form-label">Modalidade de Operação</label>
                    <CustomSelect
                      value={formModality}
                      onChange={(val) => setFormModality(val)}
                      options={MODALITY_OPTIONS}
                    />
                  </div>

                  {/* Data de Vencimento com CustomDatePicker */}
                  <div className="form-group">
                    <label className="form-label">Data Limite de Liquidação</label>
                    <CustomDatePicker
                      value={formDueDate}
                      onChange={(val) => setFormDueDate(val)}
                      placeholder="DD/MM/AAAA"
                      required
                    />
                  </div>
                </div>

                {/* Card de Simulação Financeira */}
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Receita Bruta do Contrato
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: 'var(--accent-text)' }}>
                      R${' '}
                      {(formVolume * formPrice).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Margem Líquida Estimada
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      +{formPrice > 0 ? (((formPrice * 68 - 4135) / (formPrice * 68)) * 100).toFixed(1).replace('.', ',') : '0,0'}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsHedgeModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Contrato de Hedge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: DETALHAMENTO DE BREAKEVEN POR TALHÃO                  */}
      {/* ============================================================ */}
      {isTalhaoModalOpen && (
        <div className="modal-overlay open" onClick={() => setIsTalhaoModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Ponto de Equilíbrio (Breakeven) por Talhão</div>
              <button className="modal-close" onClick={() => setIsTalhaoModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Análise de viabilidade por unidade geográfica de manejo. Considera a produtividade histórica e os investimentos específicos de cada pivô/sequeiro.
              </p>

              <div className="matrix-table-wrap" style={{ overflowX: 'auto' }}>
                <table className="contracts-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ whiteSpace: 'nowrap' }}>Talhão</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Área</th>
                      <th style={{ whiteSpace: 'nowrap' }}>COT / ha</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Breakeven</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Produtividade Est.</th>
                      <th style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>Margem Líquida / ha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TALHOES_BREAKEVEN.map((t) => (
                      <tr key={t.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span className="contract-code-tag">{t.name}</span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{t.area}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>
                            R$ {t.cotPerHa.toLocaleString('pt-BR')},00
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--warning)', fontWeight: 700 }}>
                            {t.breakevenYield.toFixed(1).replace('.', ',')} sc/ha
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-text)', fontWeight: 700 }}>
                            {t.estYield} sc/ha
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-text)', fontWeight: 700 }}>
                            +R$ {t.netPerHa.toLocaleString('pt-BR')},00
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setIsTalhaoModalOpen(false)}>
                Fechar Detalhamento
              </button>
            </div>
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
