import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ModalEntradaInsumo } from '../components/modals/ModalEntradaInsumo';
import { ModalOcorrenciaSanitaria } from '../components/modals/ModalOcorrenciaSanitaria';
import { ModalSimuladorViabilidade } from '../components/modals/ModalSimuladorViabilidade';

interface DashboardData {
  propriedade?: {
    nome: string;
    municipio?: string;
    estado?: string;
    area_total_hectares?: number;
    talhoes_ativos?: number;
    safras_ativas?: number;
    culturas?: string[];
  };
  clima?: {
    temperatura?: number;
    umidade?: number;
    precipitacao?: number;
    ultima_leitura?: string;
  };
  financeiro?: {
    custo_insumos?: number;
    lotes_estoque?: number;
    lotes_baixo_estoque?: number;
    manutencao_acumulada?: number;
    ordens_concluidas?: number;
  };
  frota?: {
    ativas?: number;
    total?: number;
    em_manutencao?: number;
    ordens_pendentes?: number;
  };
  epidemiologico?: {
    score_risco?: number;
    nivel_risco?: string;
    alertas_ativos?: number;
    ocorrencias_30dias?: number;
    agentes?: Array<{ nome: string; ocorrencias: number; severidade: string }>;
  };
  sustentabilidade?: {
    emissoes_totais?: number;
    emissao_por_hectare?: number;
    energia_renovavel_pct?: number;
    ultimo_relatorio?: string;
  };
}

export const Dashboard: React.FC = () => {
  const { propriedade } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados dos modais de ação rápida
  const [showModalInsumo, setShowModalInsumo] = useState(false);
  const [showModalSanitaria, setShowModalSanitaria] = useState(false);
  const [showModalViabilidade, setShowModalViabilidade] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4500);
  };

  useEffect(() => {
    async function carregarDashboard() {
      setLoading(true);
      try {
        const res = await api.get<DashboardData>('/propriedades/minha/dashboard/consolidado');
        setData(res);
      } catch (err) {
        console.info('Usando dados de demonstração do dashboard:', err);
        // Fallback enriquecido e fidedigno ao protótipo da Tela 01
        setData({
          propriedade: {
            nome: propriedade?.nome || 'Fazenda Santa Clara',
            municipio: propriedade?.municipio || 'Ribeirão Preto',
            estado: propriedade?.estado || 'SP',
            area_total_hectares: Number(propriedade?.area_total_hectares) || 1240,
            talhoes_ativos: 18,
            safras_ativas: 4,
            culturas: ['Soja', 'Milho', 'Cana'],
          },
          clima: {
            temperatura: 28.4,
            umidade: 62.8,
            precipitacao: 12.3,
            ultima_leitura: 'Hoje, 06:15',
          },
          financeiro: {
            custo_insumos: 247800,
            lotes_estoque: 23,
            lotes_baixo_estoque: 3,
            manutencao_acumulada: 38400,
            ordens_concluidas: 5,
          },
          frota: {
            ativas: 9,
            total: 12,
            em_manutencao: 3,
            ordens_pendentes: 2,
          },
          epidemiologico: {
            score_risco: 0.52,
            nivel_risco: 'ALTO',
            alertas_ativos: 2,
            ocorrencias_30dias: 7,
            agentes: [
              { nome: 'Ferrugem asiática', ocorrencias: 3, severidade: 'ALTA' },
              { nome: 'Percevejo marrom', ocorrencias: 2, severidade: 'MEDIA' },
              { nome: 'Lagarta-do-cartucho', ocorrencias: 2, severidade: 'CRITICA' },
            ],
          },
          sustentabilidade: {
            emissoes_totais: 14.7,
            emissao_por_hectare: 0.012,
            energia_renovavel_pct: 68.3,
            ultimo_relatorio: '2026-09',
          },
        });
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, [propriedade]);

  // Callbacks de sucesso dos modais
  const handleSuccessInsumo = (novo: { nome: string; quantidade: number; custo: number }) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        financeiro: {
          ...prev.financeiro,
          custo_insumos: (prev.financeiro?.custo_insumos || 0) + novo.custo,
          lotes_estoque: (prev.financeiro?.lotes_estoque || 0) + 1,
        },
      };
    });
    showToast(`Entrada confirmada: lote de ${novo.nome} adicionado ao estoque!`);
  };

  const handleSuccessSanitaria = (nova: { agente: string; severidade: string; talhao: string }) => {
    setData((prev) => {
      if (!prev) return prev;
      const agentesAtuais = [...(prev.epidemiologico?.agentes || [])];
      const idx = agentesAtuais.findIndex((a) => a.nome.toLowerCase() === nova.agente.toLowerCase());

      if (idx >= 0) {
        agentesAtuais[idx] = {
          ...agentesAtuais[idx],
          ocorrencias: agentesAtuais[idx].ocorrencias + 1,
          severidade: nova.severidade,
        };
      } else {
        agentesAtuais.push({
          nome: nova.agente,
          ocorrencias: 1,
          severidade: nova.severidade,
        });
      }

      const novoScore = Math.min(1.0, (prev.epidemiologico?.score_risco || 0.5) + 0.06);

      return {
        ...prev,
        epidemiologico: {
          ...prev.epidemiologico,
          alertas_ativos: (prev.epidemiologico?.alertas_ativos || 0) + 1,
          ocorrencias_30dias: (prev.epidemiologico?.ocorrencias_30dias || 0) + 1,
          score_risco: novoScore,
          nivel_risco: nova.severidade === 'CRITICA' ? 'CRITICO' : 'ALTO',
          agentes: agentesAtuais,
        },
      };
    });
    showToast(`Alerta emitido: ocorrência de ${nova.agente} em ${nova.talhao}!`);
  };

  const handleSuccessViabilidade = (resultado: { margem: number; breakEven: number }) => {
    showToast(`Simulação concluída: Margem líquida estimada em ${resultado.margem}% (Break-even: ${resultado.breakEven} sc/ha).`);
  };

  return (
    <>
      {/* Toast flutuante de notificação */}
      {toastMsg && (
        <div className="toast-msg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '18px', height: '18px', color: 'var(--accent)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Modais Interativos */}
      <ModalEntradaInsumo
        isOpen={showModalInsumo}
        onClose={() => setShowModalInsumo(false)}
        onSuccess={handleSuccessInsumo}
      />

      <ModalOcorrenciaSanitaria
        isOpen={showModalSanitaria}
        onClose={() => setShowModalSanitaria(false)}
        onSuccess={handleSuccessSanitaria}
      />

      <ModalSimuladorViabilidade
        isOpen={showModalViabilidade}
        onClose={() => setShowModalViabilidade(false)}
        onSuccess={handleSuccessViabilidade}
      />

      {/* Header */}
      <div className="page-header stagger-item" style={{ animationDelay: '0ms' }}>
        <div className="page-header-left">
          <h1 className="page-heading" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Dashboard Executivo
            {loading && <span className="sync-dot" title="Atualizando dados..." />}
          </h1>
          <p className="page-subheading">Visão consolidada da operação, saúde sanitária e sustentabilidade</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exportar
          </button>
          <button className="btn btn-primary" onClick={() => setShowModalViabilidade(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Simular Cenário
          </button>
        </div>
      </div>

      {/* Context Bar */}
      <div className="context-bar stagger-item" style={{ animationDelay: '40ms' }}>
        <div className="context-item">
          <div className="context-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
          <div>
            <div className="context-label">Propriedade</div>
            <div className="context-value">{data?.propriedade?.nome || 'Carregando...'}</div>
          </div>
        </div>
        <div className="context-divider" />
        <div className="context-item">
          <div>
            <div className="context-label">Localização</div>
            <div className="context-value">
              {data?.propriedade?.municipio}, {data?.propriedade?.estado}
            </div>
          </div>
        </div>
        <div className="context-divider" />
        <div className="context-item">
          <div>
            <div className="context-label">Área total</div>
            <div className="context-value" style={{ fontFamily: 'var(--font-mono)' }}>
              {data?.propriedade?.area_total_hectares}{' '}
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>ha</span>
            </div>
          </div>
        </div>
        <div className="context-divider" />
        <div className="context-item">
          <div>
            <div className="context-label">Talhões / Safras ativas</div>
            <div className="context-value" style={{ fontFamily: 'var(--font-mono)' }}>
              {data?.propriedade?.talhoes_ativos}{' '}
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>talhões</span> /{' '}
              {data?.propriedade?.safras_ativas}{' '}
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>safras</span>
            </div>
          </div>
        </div>
        <div className="context-divider" />
        <div className="context-item">
          <div>
            <div className="context-label">Culturas em campo</div>
            <div className="context-tags">
              {data?.propriedade?.culturas?.map((c) => (
                <span key={c} className="context-tag">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Climate Strip */}
      <div className="climate-strip stagger-item" style={{ animationDelay: '80ms' }}>
        <div className="climate-cell">
          <div className="climate-label">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
            Temperatura
          </div>
          <div className="climate-val">
            {data?.clima?.temperatura}
            <span className="climate-unit">°C</span>
          </div>
        </div>
        <div className="climate-cell">
          <div className="climate-label">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
            </svg>
            Umidade
          </div>
          <div className="climate-val">
            {data?.clima?.umidade}
            <span className="climate-unit">%</span>
          </div>
        </div>
        <div className="climate-cell">
          <div className="climate-label">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
            </svg>
            Precipitação
          </div>
          <div className="climate-val">
            {data?.clima?.precipitacao}
            <span className="climate-unit">mm</span>
          </div>
        </div>
        <div className="climate-cell">
          <div className="climate-label">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Última leitura
          </div>
          <div className="climate-val" style={{ fontSize: '16px' }}>
            {data?.clima?.ultima_leitura}
          </div>
          <div className="climate-source">INMET / CPTEC</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card stagger-item" style={{ animationDelay: '120ms' }}>
          <div className="kpi-header">
            <span className="kpi-title">Custo de insumos</span>
            <div className="kpi-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">
            R$ {((data?.financeiro?.custo_insumos || 0) / 1000).toFixed(1)}
            <span className="suffix">mil</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-detail">{data?.financeiro?.lotes_estoque} lotes em estoque</span>
            <span className="kpi-badge amber">{data?.financeiro?.lotes_baixo_estoque} em nível baixo</span>
          </div>
        </div>

        <div className="kpi-card stagger-item" style={{ animationDelay: '160ms' }}>
          <div className="kpi-header">
            <span className="kpi-title">Frota ativa</span>
            <div className="kpi-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">
            {data?.frota?.ativas}
            <span className="suffix">/ {data?.frota?.total}</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-detail">{data?.frota?.em_manutencao} em manutenção</span>
            <span className="kpi-badge amber">{data?.frota?.ordens_pendentes} ordens pendentes</span>
          </div>
        </div>

        <div className="kpi-card stagger-item" style={{ animationDelay: '200ms' }}>
          <div className="kpi-header">
            <span className="kpi-title">Alertas sanitários</span>
            <div className="kpi-icon red">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">{data?.epidemiologico?.alertas_ativos}</div>
          <div className="kpi-footer">
            <span className="kpi-detail">{data?.epidemiologico?.ocorrencias_30dias} ocorrências (30d)</span>
            <span className="kpi-badge red">Risco {data?.epidemiologico?.nivel_risco}</span>
          </div>
        </div>

        <div className="kpi-card stagger-item" style={{ animationDelay: '240ms' }}>
          <div className="kpi-header">
            <span className="kpi-title">Manutenção acum.</span>
            <div className="kpi-icon amber">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">
            R$ {((data?.financeiro?.manutencao_acumulada || 0) / 1000).toFixed(1)}
            <span className="suffix">mil</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-detail">{data?.financeiro?.ordens_concluidas} ordens concluídas</span>
            <span className="kpi-badge green">No orçamento</span>
          </div>
        </div>
      </div>

      {/* Two-Column: Epidemiológico + ESG */}
      <div className="two-col">
        {/* Painel Epidemiológico */}
        <div className="section-card stagger-item" style={{ animationDelay: '280ms' }}>
          <div className="section-header">
            <div className="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
              Vigilância Epidemiológica
            </div>
            <Link to="/vigilancia" className="section-action">
              Ver ocorrências →
            </Link>
          </div>
          <div className="section-body">
            <div className="risk-gauge">
              <div className="gauge-ring">
                <svg viewBox="0 0 80 80">
                  <circle className="track" cx="40" cy="40" r="34" />
                  <circle
                    className="fill"
                    cx="40"
                    cy="40"
                    r="34"
                    stroke={
                      (data?.epidemiologico?.score_risco || 0) > 0.6
                        ? 'var(--danger)'
                        : (data?.epidemiologico?.score_risco || 0) > 0.4
                        ? 'var(--warning)'
                        : 'var(--accent)'
                    }
                    strokeDasharray="213.6"
                    strokeDashoffset={`${213.6 * (1 - (data?.epidemiologico?.score_risco || 0.52))}`}
                    style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                  />
                </svg>
                <div className="gauge-center">
                  <span className="gauge-score">{data?.epidemiologico?.score_risco?.toFixed(2)}</span>
                  <span className="gauge-label">Score</span>
                </div>
              </div>
              <div className="risk-info">
                <span className={`risk-level ${data?.epidemiologico?.nivel_risco?.toLowerCase() || 'baixo'}`}>
                  {data?.epidemiologico?.nivel_risco}
                </span>
                <div className="risk-stat">
                  <strong>{data?.epidemiologico?.alertas_ativos}</strong> alertas ativos
                </div>
                <div className="risk-stat">
                  <strong>{data?.epidemiologico?.ocorrencias_30dias}</strong> ocorrências nos últimos 30 dias
                </div>
              </div>
            </div>

            <div className="agent-list">
              {data?.epidemiologico?.agentes?.map((ag) => (
                <div key={ag.nome} className="agent-row">
                  <div className="agent-info">
                    <span className="agent-name">{ag.nome}</span>
                    <span className="agent-count">{ag.ocorrencias} ocorrências</span>
                  </div>
                  <div className={`severity-dot ${ag.severidade}`} title={`Severidade: ${ag.severidade}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Painel ESG */}
        <div className="section-card stagger-item" style={{ animationDelay: '320ms' }}>
          <div className="section-header">
            <div className="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 0 1 6.69 14.036m0 0-.177-.529A2.25 2.25 0 0 0 17.128 15H16.5l-.324-.324a1.453 1.453 0 0 0-2.328.377l-.036.073a1.586 1.586 0 0 1-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 0 1-5.276 3.67m0 0a9 9 0 0 1-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25" />
              </svg>
              Sustentabilidade ESG
            </div>
            <Link to="/energia-esg" className="section-action">
              Relatório completo →
            </Link>
          </div>
          <div className="section-body">
            <div className="esg-grid">
              <div className="esg-metric">
                <span className="esg-metric-label">Emissões totais</span>
                <span className="esg-metric-value">
                  {data?.sustentabilidade?.emissoes_totais}{' '}
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 400 }}>tCO₂e</span>
                </span>
                <span className="esg-metric-sub">Período: {data?.sustentabilidade?.ultimo_relatorio}</span>
              </div>
              <div className="esg-metric">
                <span className="esg-metric-label">Emissão/Hectare</span>
                <span className="esg-metric-value">{data?.sustentabilidade?.emissao_por_hectare}</span>
                <span className="esg-metric-sub">tCO₂e por hectare</span>
              </div>
              <div className="esg-metric">
                <span className="esg-metric-label">Energia renovável</span>
                <span className="esg-metric-value" style={{ color: 'var(--accent-text)' }}>
                  {data?.sustentabilidade?.energia_renovavel_pct}%
                </span>
                <span className="esg-metric-sub">Solar + Biogás</span>
              </div>
              <div className="esg-metric">
                <span className="esg-metric-label">Último relatório</span>
                <span className="esg-metric-value" style={{ fontSize: '16px' }}>
                  {data?.sustentabilidade?.ultimo_relatorio}
                </span>
                <span className="esg-metric-sub" style={{ color: 'var(--accent-text)' }}>
                  Publicado
                </span>
              </div>
            </div>

            <div className="verde-badge">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <div>
                <div className="verde-badge-text">Elegível ao Crédito Rural Verde</div>
                <div className="verde-badge-sub">Critérios Plano ABC+ atendidos com base no relatório atual</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three-Column: Insumos + Frota + Ações Rápidas */}
      <div className="three-col">
        {/* Gestão de Insumos */}
        <div className="section-card stagger-item" style={{ animationDelay: '360ms' }}>
          <div className="section-header">
            <div className="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
              Gestão de Insumos
            </div>
            <Link to="/insumos" className="section-action">
              Gerenciar →
            </Link>
          </div>
          <div className="section-body">
            <div className="ops-grid">
              <div className="ops-block">
                <div className="ops-block-title">Estoque</div>
                <div className="ops-row">
                  <span className="ops-row-label">Lotes ativos</span>
                  <span className="ops-row-value">{data?.financeiro?.lotes_estoque}</span>
                </div>
                <div className="ops-row">
                  <span className="ops-row-label">Nível crítico</span>
                  <span className="ops-row-value" style={{ color: 'var(--warning)' }}>
                    {data?.financeiro?.lotes_baixo_estoque}
                  </span>
                </div>
              </div>
              <div className="ops-block">
                <div className="ops-block-title">Financeiro</div>
                <div className="ops-row">
                  <span className="ops-row-label">Custo total</span>
                  <span className="ops-row-value">
                    R$ {((data?.financeiro?.custo_insumos || 0) / 1000).toFixed(0)}k
                  </span>
                </div>
                <div className="ops-row">
                  <span className="ops-row-label">Status</span>
                  <span className="ops-row-value" style={{ color: 'var(--accent-text)' }}>
                    Regular
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frota e Maquinários */}
        <div className="section-card stagger-item" style={{ animationDelay: '400ms' }}>
          <div className="section-header">
            <div className="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
              </svg>
              Frota e Manutenção
            </div>
            <Link to="/maquinarios" className="section-action">
              Ver frotas →
            </Link>
          </div>
          <div className="section-body">
            <div className="fleet-bar">
              <div
                className="fleet-bar-seg op"
                style={{
                  width: `${((data?.frota?.ativas || 0) / (data?.frota?.total || 1)) * 100}%`,
                }}
              />
              <div
                className="fleet-bar-seg maint"
                style={{
                  width: `${((data?.frota?.em_manutencao || 0) / (data?.frota?.total || 1)) * 100}%`,
                }}
              />
            </div>
            <div className="fleet-legend">
              <div className="fleet-legend-item">
                <div className="fleet-legend-dot" style={{ background: 'var(--accent)' }} />
                <span>{data?.frota?.ativas} operacionais</span>
              </div>
              <div className="fleet-legend-item">
                <div className="fleet-legend-dot" style={{ background: 'var(--warning)' }} />
                <span>{data?.frota?.em_manutencao} em manutenção</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas Executivas (Botões com Modais Interativos) */}
        <div className="section-card stagger-item" style={{ animationDelay: '440ms' }}>
          <div className="section-header">
            <div className="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
              Ações Rápidas Executivas
            </div>
          </div>
          <div className="section-body">
            <div className="quick-actions">
              <button
                type="button"
                className="quick-action"
                onClick={() => setShowModalInsumo(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="quick-action-text">Registrar entrada de insumo</span>
                <span className="quick-action-arrow">→</span>
              </button>

              <button
                type="button"
                className="quick-action"
                onClick={() => setShowModalSanitaria(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <span className="quick-action-text">Registrar ocorrência sanitária</span>
                <span className="quick-action-arrow">→</span>
              </button>

              <button
                type="button"
                className="quick-action"
                onClick={() => setShowModalViabilidade(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                </svg>
                <span className="quick-action-text">Simular viabilidade econômica</span>
                <span className="quick-action-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <div className="page-timestamp stagger-item" style={{ animationDelay: '480ms' }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '12px', height: '12px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        Dados sincronizados em tempo real • Sistema operacional ativo
      </div>
    </>
  );
};
