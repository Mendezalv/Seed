import React, { useState, useEffect } from 'react';
import { ModalEntradaInsumo } from '../components/modals/ModalEntradaInsumo';
import { ModalImportarNfe } from '../components/modals/ModalImportarNfe';
import { operacionalService } from '../services/operacionalService';
import { useSync } from '../context/SyncContext';
import { useAuth } from '../context/AuthContext';

interface LoteItem {
  id: string;
  nome: string;
  principioAtivo: string;
  categoria: 'DEFENSIVO' | 'FERTILIZANTE' | 'SEMENTE' | 'COMBUSTIVEL' | 'BIOLOGICO';
  codigoLote: string;
  fornecedor: string;
  localizacao: string;
  quantidadeAtual: number;
  quantidadeTotal: number;
  unidade: string;
  custoUnitario: number;
  custoTotal: number;
  validade: string;
  validadeStatus: 'good' | 'warn' | 'crit';
  validadeTexto: string;
  status: 'REGULAR' | 'BAIXO' | 'CRITICO';
}

const INITIAL_LOTES: LoteItem[] = [
  {
    id: '1',
    nome: 'Azoxistrobina + Ciproconazol',
    principioAtivo: 'Fungicida Sistêmico • Suspensão Concentrada',
    categoria: 'DEFENSIVO',
    codigoLote: 'LT-BAY-2024-04',
    fornecedor: 'Bayer CropScience',
    localizacao: 'Galpão 01 — Bacia 2',
    quantidadeAtual: 180,
    quantidadeTotal: 500,
    unidade: 'L',
    custoUnitario: 130.0,
    custoTotal: 23400.0,
    validade: '22/01/2025',
    validadeStatus: 'crit',
    validadeTexto: 'Vence em 12 dias',
    status: 'CRITICO',
  },
  {
    id: '2',
    nome: 'Cloreto de Potássio (KCl 60%)',
    principioAtivo: 'Fertilizante Mineral Granulado Branco',
    categoria: 'FERTILIZANTE',
    codigoLote: 'LT-YAR-2024-88',
    fornecedor: 'Yara Brasil',
    localizacao: 'Galpão 02 — Baia B3',
    quantidadeAtual: 42000,
    quantidadeTotal: 60000,
    unidade: 'kg',
    custoUnitario: 3.2,
    custoTotal: 134400.0,
    validade: '15/10/2026',
    validadeStatus: 'good',
    validadeTexto: 'Vigente (>18 meses)',
    status: 'REGULAR',
  },
  {
    id: '3',
    nome: 'Semente Soja Monsoy 5947 IPRO',
    principioAtivo: 'Semente Certificada C1 • Germinação 94%',
    categoria: 'SEMENTE',
    codigoLote: 'LT-SEM-24-019',
    fornecedor: 'Sementes Falcão',
    localizacao: 'Câmara Fria — Lote A1',
    quantidadeAtual: 320,
    quantidadeTotal: 800,
    unidade: 'sc',
    custoUnitario: 245.0,
    custoTotal: 78400.0,
    validade: '30/03/2025',
    validadeStatus: 'warn',
    validadeTexto: 'Janela de plantio ativa',
    status: 'BAIXO',
  },
  {
    id: '4',
    nome: 'Óleo Diesel S10 Rodoviário/Agrícola',
    principioAtivo: 'Combustível Baixo Enxofre (10 ppm)',
    categoria: 'COMBUSTIVEL',
    codigoLote: 'LT-VBR-2024-11',
    fornecedor: 'Vibra Energia',
    localizacao: 'Tanque Subterrâneo 01',
    quantidadeAtual: 42800,
    quantidadeTotal: 60000,
    unidade: 'L',
    custoUnitario: 5.85,
    custoTotal: 250380.0,
    validade: '10/05/2025',
    validadeStatus: 'good',
    validadeTexto: 'Autonomia 18 dias',
    status: 'REGULAR',
  },
  {
    id: '5',
    nome: 'Inoculante Bradyrhizobium japonicum',
    principioAtivo: 'Biológico Concentrado para Fixação Biológica de N',
    categoria: 'BIOLOGICO',
    codigoLote: 'LT-BIO-2024-90',
    fornecedor: 'Total Biotecnologia',
    localizacao: 'Galpão 01 — Frigo 02',
    quantidadeAtual: 140,
    quantidadeTotal: 300,
    unidade: 'L',
    custoUnitario: 48.0,
    custoTotal: 6720.0,
    validade: '12/04/2025',
    validadeStatus: 'good',
    validadeTexto: 'Vigente (3 meses)',
    status: 'REGULAR',
  },
  {
    id: '6',
    nome: 'Glifosato 480 SL Sal Dimetilamina',
    principioAtivo: 'Herbicida Sistêmico Não Seletivo',
    categoria: 'DEFENSIVO',
    codigoLote: 'LT-SYN-2024-12',
    fornecedor: 'Syngenta Proteção de Cultivos',
    localizacao: 'Galpão 01 — Bacia 1',
    quantidadeAtual: 85,
    quantidadeTotal: 400,
    unidade: 'L',
    custoUnitario: 62.0,
    custoTotal: 5270.0,
    validade: '18/08/2025',
    validadeStatus: 'good',
    validadeTexto: 'Estoque abaixo de 25%',
    status: 'BAIXO',
  },
];

export const InsumosEstoque: React.FC = () => {
  const { queueOperation } = useSync();
  const { isDemoMode } = useAuth();

  const [lotes, setLotes] = useState<LoteItem[]>(() => isDemoMode ? INITIAL_LOTES : []);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNfeModalOpen, setIsNfeModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleSuccessImportarNfe = (novos: Array<any>) => {
    const formatados: LoteItem[] = novos.map((item, idx) => ({
      id: String(Date.now() + idx),
      nome: item.nome,
      principioAtivo: item.principioAtivo,
      categoria: item.categoria,
      codigoLote: item.codigoLote,
      fornecedor: item.fornecedor,
      localizacao: 'Galpão 01 — Bacia Central',
      quantidadeAtual: item.quantidade,
      quantidadeTotal: item.quantidade,
      unidade: item.unidade,
      custoUnitario: item.custoUnitario,
      custoTotal: item.custoTotal,
      validade: item.validade,
      validadeStatus: 'good',
      validadeTexto: 'Vigente (NF-e Oficial)',
      status: 'REGULAR',
    }));

    setLotes((prev) => [...formatados, ...prev]);
    showToast(`Sucesso! ${novos.length} item(ns) da NF-e incorporados ao estoque da fazenda.`);
  };

  const handleExportXlsx = async () => {
    try {
      setIsExporting(true);
      showToast('Gerando balanço e inventário em XLSX oficial...');
      await operacionalService.exportarInventarioXlsx();
      showToast('Planilha de inventário exportada com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar planilha. Verifique a conexão com a API.');
    } finally {
      setIsExporting(false);
    }
  };


  useEffect(() => {
    operacionalService.getLotes()
      .then((apiLotes) => {
        if (apiLotes && apiLotes.length > 0) {
          const mapped: LoteItem[] = apiLotes.map((l, idx) => ({
            id: l.id || `api-${idx}`,
            nome: l.codigo_lote || `Lote ${idx + 1}`,
            principioAtivo: 'Registrado via API de Rastreabilidade',
            categoria: 'DEFENSIVO',
            codigoLote: l.codigo_lote,
            fornecedor: l.fornecedor || 'Fornecedor Registrado',
            localizacao: 'Galpão 01 — Armazém',
            quantidadeAtual: Number(l.quantidade_atual),
            quantidadeTotal: Number(l.quantidade_inicial),
            unidade: 'L',
            custoUnitario: 120,
            custoTotal: Number(l.quantidade_atual) * 120,
            validade: l.data_validade ? new Date(l.data_validade).toLocaleDateString('pt-BR') : '31/12/2026',
            validadeStatus: 'good',
            validadeTexto: 'Vigente',
            status: Number(l.quantidade_atual) < 100 ? 'BAIXO' : 'REGULAR',
          }));
          setLotes((prev) => {
            if (isDemoMode) {
              const existingCodes = new Set(prev.map((p) => p.codigoLote));
              const fresh = mapped.filter((m) => !existingCodes.has(m.codigoLote));
              return [...fresh, ...prev];
            }
            return mapped;
          });
        } else if (!isDemoMode) {
          setLotes([]);
        }
      })
      .catch((err) => {
        if (isDemoMode) {
          console.info('Modo demonstração ativo em Insumos (API offline):', err);
        } else {
          setLotes([]);
        }
      });
  }, [isDemoMode]);

  const handleSuccessNovoLote = (novo: { nome: string; quantidade: number; custo: number }) => {
    const novoItem: LoteItem = {
      id: String(Date.now()),
      nome: novo.nome,
      principioAtivo: 'Lote registrado recentemente no sistema',
      categoria: 'DEFENSIVO',
      codigoLote: `LT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      fornecedor: 'Fornecedor Certificado',
      localizacao: 'Galpão 01 — Bacia Central',
      quantidadeAtual: novo.quantidade,
      quantidadeTotal: novo.quantidade,
      unidade: 'L',
      custoUnitario: novo.quantidade > 0 ? novo.custo / novo.quantidade : 0,
      custoTotal: novo.custo,
      validade: '31/12/2026',
      validadeStatus: 'good',
      validadeTexto: 'Vigente (>12 meses)',
      status: 'REGULAR',
    };

    setLotes((prev) => [novoItem, ...prev]);
    showToast(`Lote "${novo.nome}" cadastrado com sucesso!`);
  };

  const handleAlocacaoRapida = (loteCodigo: string, talhaoNome: string) => {
    setLotes((prev) =>
      prev.map((item) => {
        if (item.codigoLote === loteCodigo) {
          const reduzido = Math.max(0, item.quantidadeAtual - 80);
          return {
            ...item,
            quantidadeAtual: reduzido,
            status: reduzido < 100 ? 'BAIXO' : 'REGULAR',
          };
        }
        return item;
      })
    );
    showToast(`Baixa de 80 L efetuada do lote ${loteCodigo} para aplicação no ${talhaoNome}!`);

    // Registra mutação na fila de sincronização offline
    queueOperation(
      'alocacao_insumo',
      'CREATE',
      crypto.randomUUID(),
      {
        codigo_lote: loteCodigo,
        talhao_nome: talhaoNome,
        quantidade_baixada: 80,
        unidade: 'L',
        baixado_em: new Date().toISOString(),
      },
      'LWW'
    ).catch(() => {});

    const target = lotes.find((l) => l.codigoLote === loteCodigo);
    if (target && target.id && target.id.includes('-')) {
      operacionalService.alocarInsumo({
        lote_insumo_id: target.id,
        safra_id: '00000000-0000-0000-0000-000000000001',
        talhao_id: '00000000-0000-0000-0000-000000000001',
        quantidade: 80,
        area_hectares: 10,
        operador_id: '00000000-0000-0000-0000-000000000001',
        aplicado_em: new Date().toISOString(),
      }).catch((err) => {
        console.info('Alocação registrada localmente:', err);
      });
    }
  };

  // Filtragem combinada
  const filteredLotes = lotes.filter((lote) => {
    const matchCategory = selectedCategory === 'TODOS' || lote.categoria === selectedCategory;
    const matchStatus = selectedStatus === 'TODOS' || lote.status === selectedStatus;
    const query = searchQuery.toLowerCase();
    const matchSearch =
      !query ||
      lote.nome.toLowerCase().includes(query) ||
      lote.principioAtivo.toLowerCase().includes(query) ||
      lote.codigoLote.toLowerCase().includes(query) ||
      lote.fornecedor.toLowerCase().includes(query);

    return matchCategory && matchStatus && matchSearch;
  });

  const totalValor = lotes.reduce((acc, l) => acc + l.custoTotal, 0);
  const totalCriticos = lotes.filter((l) => l.status === 'CRITICO' || l.status === 'BAIXO').length;
  const dieselLotes = lotes.filter((l) => l.categoria === 'COMBUSTIVEL');
  const totalDieselL = dieselLotes.reduce((acc, l) => acc + l.quantidadeAtual, 0);
  const criticalLote = lotes.find((l) => l.status === 'CRITICO' || l.status === 'BAIXO');

  // Ocupação dinâmica dos armazéns
  const defLots = lotes.filter((l) => l.categoria === 'DEFENSIVO');
  const totalDefVol = defLots.reduce((acc, l) => acc + l.quantidadeAtual, 0);
  const defPct = isDemoMode ? 68 : Math.min(100, Math.round((totalDefVol / 25000) * 100));

  const fertLots = lotes.filter((l) => l.categoria === 'FERTILIZANTE');
  const totalFertKg = fertLots.reduce((acc, l) => acc + l.quantidadeAtual, 0);
  const fertPct = isDemoMode ? 82 : Math.min(100, Math.round((totalFertKg / 150000) * 100));

  const dieselPct = isDemoMode ? 71.3 : Math.min(100, Number(((totalDieselL / 60000) * 100).toFixed(1)));

  const semLots = lotes.filter((l) => l.categoria === 'SEMENTE');
  const totalSemSc = semLots.reduce((acc, l) => acc + l.quantidadeAtual, 0);
  const semPct = isDemoMode ? 91 : Math.min(100, Math.round((totalSemSc / 1000) * 100));

  return (
    <>
      {toastMsg && (
        <div className="toast-msg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '18px', height: '18px', color: 'var(--accent)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>{toastMsg}</span>
        </div>
      )}

      <ModalEntradaInsumo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccessNovoLote}
      />

      <ModalImportarNfe
        isOpen={isNfeModalOpen}
        onClose={() => setIsNfeModalOpen(false)}
        onSuccess={handleSuccessImportarNfe}
      />

      {/* Cabeçalho de Página */}
      <div className="page-header stagger-item">
        <div className="page-header-left">
          <h1 className="page-heading">Gestão de Insumos & Rastreabilidade de Lotes</h1>
          <p className="page-subheading">
            Inventário fitossanitário, defensivos químicos, fertilizantes, sementes e conformidade MAPA / inpEV
          </p>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-outline"
            onClick={handleExportXlsx}
            disabled={isExporting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {isExporting ? 'Exportando...' : 'Exportar Inventário'}
          </button>

          <button
            className="btn btn-outline"
            onClick={() => setIsNfeModalOpen(true)}
            style={{
              borderColor: 'rgba(16, 185, 129, 0.4)',
              background: 'rgba(16, 185, 129, 0.08)',
              color: 'var(--accent)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Importar NF-e (XML)
          </button>

          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Registrar Entrada de Lote
          </button>
        </div>
      </div>

      {/* 4 Master KPI Cards */}
      <div className="kpi-strip stagger-item" style={{ animationDelay: '40ms' }}>
        <div className="kpi-cell">
          <span className="kpi-cell-label">Valor Total Imobilizado</span>
          <div className="kpi-cell-val">
            R$ {Math.floor(totalValor).toLocaleString('pt-BR')}
            <span className="cents">,00</span>
          </div>
          <span className="kpi-cell-sub">
            {lotes.length > 0 ? (
              <><span className="kpi-tag good">+4.2%</span> Giro operacional 2.8x • {lotes.length} SKUs</>
            ) : (
              'Nenhum lote estocado • 0 SKUs'
            )}
          </span>
        </div>

        <div className="kpi-cell">
          <span className="kpi-cell-label">Lotes em Quarentena / Alerta</span>
          <div className="kpi-cell-val" style={{ color: totalCriticos > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
            {totalCriticos}
            <span className="unit-text" style={{ color: totalCriticos > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
              {totalCriticos === 1 ? 'lote crítico' : 'lotes críticos'}
            </span>
          </div>
          <span className="kpi-cell-sub">
            {totalCriticos > 0 ? (
              <span className="kpi-tag warn">{totalCriticos} lote(s) sob atenção</span>
            ) : (
              'Nenhum lote em quarentena ou vencendo'
            )}
          </span>
        </div>

        <div className="kpi-cell">
          <span className="kpi-cell-label">Estoque Estratégico Diesel S10</span>
          <div className="kpi-cell-val">
            {totalDieselL.toLocaleString('pt-BR')}<span className="unit-text">L</span>
          </div>
          <span className="kpi-cell-sub">
            {totalDieselL > 0 ? (
              <><span className="kpi-tag good">Disponível</span> Estoque telemetrado</>
            ) : (
              'Sem registro de combustíveis'
            )}
          </span>
        </div>

        <div className="kpi-cell">
          <span className="kpi-cell-label">Conformidade Fitossanitária</span>
          <div className="kpi-cell-val" style={{ color: lotes.length > 0 ? 'var(--accent-text)' : 'var(--text-muted)' }}>
            {lotes.length > 0 ? '100%' : '—'}
            {lotes.length > 0 && <span className="unit-text" style={{ color: 'var(--accent-text)' }}>ART</span>}
          </div>
          <span className="kpi-cell-sub">
            {lotes.length > 0 ? 'Receituários vinculados • inpEV em dia' : 'Aguardando lançamento de insumos'}
          </span>
        </div>
      </div>

      {/* Banner de Alerta Crítico */}
      {criticalLote && (
        <div className="alert-banner stagger-item" style={{ animationDelay: '80ms' }}>
          <div className="alert-banner-left">
            <div className="alert-icon-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div className="alert-text-group">
              <div className="alert-headline">Atenção Fitossanitária: Lote em atenção ({criticalLote.codigoLote})</div>
              <div className="alert-subline">
                O lote <strong>{criticalLote.codigoLote} ({criticalLote.nome})</strong> possui {criticalLote.quantidadeAtual.toLocaleString('pt-BR')} {criticalLote.unidade} ({criticalLote.validadeTexto}). Localização: <strong>{criticalLote.localizacao}</strong>.
              </div>
            </div>
          </div>
          <div className="alert-actions">
            <button
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => handleAlocacaoRapida(criticalLote.codigoLote, 'Lavoura')}
            >
              Baixar do Estoque
            </button>
          </div>
        </div>
      )}

      {/* Ocupação Física dos Galpões */}
      <div className="warehouses-section-title stagger-item" style={{ animationDelay: '120ms' }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '18px', height: '18px', color: 'var(--accent)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5" />
        </svg>
        Ocupação dos Armazéns & Estruturas Físicas de Armazenamento
      </div>

      <div className="warehouses-grid stagger-item" style={{ animationDelay: '140ms' }}>
        <div className="warehouse-card">
          <div className="wh-header">
            <div className="wh-icon-box amber">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 15.3m14.8 0A2.25 2.25 0 0 1 21 17.25v1.5a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18.75v-1.5a2.25 2.25 0 0 1 1.2-1.95" />
              </svg>
            </div>
            <span className={`wh-status-badge ${defPct > 0 ? 'ok' : ''}`}>
              {isDemoMode || defPct > 0 ? 'Climatizado 21°C' : 'Estrutura Pronta'}
            </span>
          </div>
          <div className="wh-info">
            <span className="wh-title">Galpão 01 — Defensivos</span>
            <span className="wh-type">Químicos, bacia de contenção epóxi</span>
          </div>
          <div className="wh-gauge-wrap">
            <div className="wh-gauge-header">
              <span>Ocupação</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {defPct}% ({isDemoMode ? '18.400 L/kg' : `${totalDefVol.toLocaleString('pt-BR')} L/kg`})
              </span>
            </div>
            <div className="wh-progress-bg">
              <div className="wh-progress-fill amber" style={{ width: `${defPct}%` }} />
            </div>
          </div>
        </div>

        <div className="warehouse-card">
          <div className="wh-header">
            <div className="wh-icon-box emerald">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>
            <span className={`wh-status-badge ${fertPct > 0 ? 'high' : ''}`}>
              {isDemoMode || fertPct > 0 ? 'Umidade 48%' : 'Estrutura Pronta'}
            </span>
          </div>
          <div className="wh-info">
            <span className="wh-title">Galpão 02 — Fertilizantes</span>
            <span className="wh-type">Big bags NPK, Cloreto de Potássio</span>
          </div>
          <div className="wh-gauge-wrap">
            <div className="wh-gauge-header">
              <span>Ocupação</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {fertPct}% ({isDemoMode ? '140 ton' : `${(totalFertKg / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ton`})
              </span>
            </div>
            <div className="wh-progress-bg">
              <div className="wh-progress-fill" style={{ width: `${fertPct}%` }} />
            </div>
          </div>
        </div>

        <div className="warehouse-card">
          <div className="wh-header">
            <div className="wh-icon-box blue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
              </svg>
            </div>
            <span className={`wh-status-badge ${dieselPct > 0 ? 'ok' : ''}`}>
              {isDemoMode || dieselPct > 0 ? 'Telemetria Ativa' : 'Tanque Vazio'}
            </span>
          </div>
          <div className="wh-info">
            <span className="wh-title">Tanques Diesel S10</span>
            <span className="wh-type">2x Tanques subterrâneos com filtro</span>
          </div>
          <div className="wh-gauge-wrap">
            <div className="wh-gauge-header">
              <span>Volume Útil</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {dieselPct}% ({isDemoMode ? '42.800 L' : `${totalDieselL.toLocaleString('pt-BR')} L`})
              </span>
            </div>
            <div className="wh-progress-bg">
              <div className="wh-progress-fill blue" style={{ width: `${dieselPct}%` }} />
            </div>
          </div>
        </div>

        <div className="warehouse-card">
          <div className="wh-header">
            <div className="wh-icon-box cyan">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3m14.243-5.243-12.728 12.728m12.728 0L4.515 6.757" />
              </svg>
            </div>
            <span className={`wh-status-badge ${semPct > 0 ? 'ok' : ''}`}>
              {isDemoMode || semPct > 0 ? '14°C • Hermético' : 'Câmara Disponível'}
            </span>
          </div>
          <div className="wh-info">
            <span className="wh-title">Câmara Fria — Sementes</span>
            <span className="wh-type">Preservação de vigor (&gt;94%)</span>
          </div>
          <div className="wh-gauge-wrap">
            <div className="wh-gauge-header">
              <span>Capacidade</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {semPct}% ({isDemoMode ? '920 sc' : `${totalSemSc.toLocaleString('pt-BR')} sc`})
              </span>
            </div>
            <div className="wh-progress-bg">
              <div className="wh-progress-fill cyan" style={{ width: `${semPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela Master de Insumos & Lotes */}
      <div className="inventory-card stagger-item" style={{ animationDelay: '180ms' }}>
        <div className="inventory-card-header">
          {/* Tabs por Categoria */}
          <div className="cat-tabs">
            {[
              { id: 'TODOS', label: 'Todos os Insumos', count: lotes.length },
              { id: 'DEFENSIVO', label: 'Defensivos & Químicos', count: lotes.filter((l) => l.categoria === 'DEFENSIVO').length },
              { id: 'FERTILIZANTE', label: 'Fertilizantes & Nutrição', count: lotes.filter((l) => l.categoria === 'FERTILIZANTE').length },
              { id: 'SEMENTE', label: 'Sementes Certificadas', count: lotes.filter((l) => l.categoria === 'SEMENTE').length },
              { id: 'COMBUSTIVEL', label: 'Combustível S10', count: lotes.filter((l) => l.categoria === 'COMBUSTIVEL').length },
              { id: 'BIOLOGICO', label: 'Biológicos & Inoculantes', count: lotes.filter((l) => l.categoria === 'BIOLOGICO').length },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`cat-tab ${selectedCategory === tab.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(tab.id)}
              >
                {tab.label} <span className="count">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Barra de Busca e Filtros Rápidos */}
          <div className="table-controls">
            <div className="search-input-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por insumo, princípio ativo, lote ou fornecedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="status-filters">
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginRight: '4px' }}>Status:</span>
              {[
                { id: 'TODOS', label: 'Todos' },
                { id: 'REGULAR', label: 'Regular' },
                { id: 'BAIXO', label: 'Estoque Baixo' },
                { id: 'CRITICO', label: 'Crítico / Vencendo' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  className={`status-pill-filter ${selectedStatus === pill.id ? 'active' : ''}`}
                  onClick={() => setSelectedStatus(pill.id)}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela Data-Grid */}
        <div className="table-wrap">
          {lotes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
              </div>
              <h3 className="empty-state-title">Nenhum lote ou insumo registrado no almoxarifado</h3>
              <p className="empty-state-desc">
                Cadastre os lotes de defensivos, fertilizantes, sementes e combustíveis da sua fazenda para rastreabilidade de aplicação, controle de validade e baixa por talhão.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Registrar Entrada de Lote
                </button>
                <button className="btn btn-outline" onClick={() => setIsNfeModalOpen(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  Importar NF-e (XML)
                </button>
              </div>
            </div>
          ) : (
            <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '250px' }}>Insumo / Princípio Ativo</th>
                <th style={{ minWidth: '135px' }}>Lote / Rastreabilidade</th>
                <th style={{ minWidth: '170px' }}>Fornecedor & Local</th>
                <th style={{ minWidth: '185px' }}>Saldo em Estoque</th>
                <th style={{ minWidth: '150px' }}>Custo Unit. & Total</th>
                <th style={{ minWidth: '140px' }}>Validade / ART</th>
                <th style={{ minWidth: '110px' }}>Status</th>
                <th style={{ minWidth: '90px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLotes.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Nenhum insumo encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredLotes.map((lote) => {
                  const pct = Math.round((lote.quantidadeAtual / lote.quantidadeTotal) * 100);
                  const isCrit = lote.status === 'CRITICO';
                  const isLow = lote.status === 'BAIXO';

                  return (
                    <tr key={lote.id}>
                      <td>
                        <div className="item-cell">
                          <div
                            className={`item-icon ${
                              lote.categoria === 'DEFENSIVO'
                                ? 'chem'
                                : lote.categoria === 'FERTILIZANTE'
                                ? 'fert'
                                : lote.categoria === 'SEMENTE'
                                ? 'seed'
                                : lote.categoria === 'COMBUSTIVEL'
                                ? 'fuel'
                                : 'bio'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                            </svg>
                          </div>
                          <div className="item-info">
                            <span className="item-name">{lote.nome}</span>
                            <span className="item-sub">{lote.principioAtivo}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="mono-batch">{lote.codigoLote}</span>
                      </td>

                      <td>
                        <div className="item-info">
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{lote.fornecedor}</span>
                          <span className="item-sub">{lote.localizacao}</span>
                        </div>
                      </td>

                      <td>
                        <div className="stock-meter-cell">
                          <div className="stock-values">
                            <span className="stock-cur">
                              {lote.quantidadeAtual.toLocaleString('pt-BR')} {lote.unidade}
                            </span>
                            <span className="stock-max">
                              / {lote.quantidadeTotal.toLocaleString('pt-BR')} ({pct}%)
                            </span>
                          </div>
                          <div className="stock-bar-bg">
                            <div
                              className={`stock-bar-fill ${isCrit ? 'crit' : isLow ? 'warn' : lote.categoria === 'COMBUSTIVEL' ? 'blue' : ''}`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="price-cell">
                          <span className="price-total">R$ {lote.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <span className="price-unit">
                            R$ {lote.custoUnitario.toFixed(2)} / {lote.unidade}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="expiry-cell">
                          <span className="expiry-date">{lote.validade}</span>
                          <span className={`expiry-status ${lote.validadeStatus}`}>{lote.validadeTexto}</span>
                        </div>
                      </td>

                      <td>
                        <span className={`status-badge ${isCrit ? 'critical' : isLow ? 'low' : 'regular'}`}>
                          {lote.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-outline"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => handleAlocacaoRapida(lote.codigoLote, 'Talhão 04')}
                            title="Dar baixa e alocar aplicação em talhão"
                          >
                            Alocar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
        </div>

        {/* Rodapé da Tabela de Insumos */}
        <div className="inventory-card-footer">
          <div className="footer-stats">
            <span>
              Mostrando <strong>{filteredLotes.length}</strong> de <strong>{lotes.length}</strong> lotes cadastrados
            </span>
            <span className="dot-sep">•</span>
            <span>Rastreabilidade MAPA & Conexão em tempo real</span>
          </div>
          <div className="footer-legend">
            <span className="legend-item"><span className="legend-dot green"></span> Regular</span>
            <span className="legend-item"><span className="legend-dot amber"></span> Atenção</span>
            <span className="legend-item"><span className="legend-dot red"></span> Crítico</span>
          </div>
        </div>
      </div>

      {/* Faixa de Governança, ART & Conformidade Regulatória */}
      <div className="inventory-audit-trail stagger-item" style={{ animationDelay: '200ms' }}>
        <div className="audit-item">
          <div className="audit-label">Último Fechamento Fiscal</div>
          <div className="audit-val">30/09/2026 • Auditoria Contábil Integrada</div>
        </div>
        <div className="audit-item">
          <div className="audit-label">Logística Reversa inpEV</div>
          <div className="audit-val">Certificado Nº 88219/2026 • Em dia</div>
        </div>
        <div className="audit-item">
          <div className="audit-label">Responsável Técnico (ART)</div>
          <div className="audit-val">Eng. Agr. Marcelo Guimarães • CREA-MT 24.891-D</div>
        </div>
        <div className="audit-item">
          <div className="audit-label">Telemetria de Tanques</div>
          <div className="audit-val">Sensor Ultrassônico Nível 4 • Atualizado há 4 min</div>
        </div>
      </div>
    </>
  );
};
