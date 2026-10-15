import React from 'react';
import { useCotacoes } from '../../context/CotacoesContext';

interface ModalCotacoesMercadoProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalCotacoesMercado: React.FC<ModalCotacoesMercadoProps> = ({ isOpen, onClose }) => {
  const { cotacoes, isSimulating, lastUpdate, simularAgora } = useCotacoes();

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '680px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              style={{ width: '20px', height: '20px', color: 'var(--accent)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
              />
            </svg>
            Pregão de Commodities & Câmbio em Tempo Real
          </div>
          <button className="modal-close" onClick={onClose} title="Fechar">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Header informativo com indicador de status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  boxShadow: '0 0 8px var(--accent)',
                }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>
                Dados sincronizados com CEPEA/ESALQ, B3 e Banco Central (SGS)
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Atualizado às {lastUpdate}
            </span>
          </div>

          {/* Grid de Cotações */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cotacoes.map((item) => {
              const isPositive = item.variacao_pct >= 0;
              return (
                <div
                  key={item.codigo}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
                    alignItems: 'center',
                    padding: '12px 14px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all 200ms ease',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                      {item.nome}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {item.mercado} • {item.unidade}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                      }}
                    >
                      R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Ant: R$ {(item.preco_anterior || item.preco).toFixed(2)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                        background: isPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: isPositive ? 'var(--accent-text)' : 'var(--danger)',
                        border: `1px solid ${isPositive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                      }}
                    >
                      {isPositive ? '▲ +' : '▼ '}
                      {item.variacao_pct.toFixed(2)}%
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <div>Máx: R$ {(item.maxima_dia || item.preco * 1.01).toFixed(2)}</div>
                    <div>Mín: R$ {(item.minima_dia || item.preco * 0.99).toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => simularAgora()}
            disabled={isSimulating}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              style={{ width: '15px', height: '15px', animation: isSimulating ? 'spin 1s linear infinite' : 'none' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            {isSimulating ? 'Oscilando Pregão...' : 'Simular Variação de Pregão'}
          </button>

          <button type="button" className="btn btn-primary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
