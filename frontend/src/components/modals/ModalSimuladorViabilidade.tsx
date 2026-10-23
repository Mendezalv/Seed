import React, { useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CustomSelect } from '../ui/CustomSelect';

interface ModalSimuladorViabilidadeProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (resultado: { margem: number; breakEven: number }) => void;
}

export const ModalSimuladorViabilidade: React.FC<ModalSimuladorViabilidadeProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isDemoMode } = useAuth();

  const [safra, setSafra] = useState(
    isDemoMode ? 'Safra 2026/27 - Soja Verão (1.240 ha)' : 'Safra Atual - Planejamento'
  );
  const [precoSaca, setPrecoSaca] = useState(isDemoMode ? '138.50' : '135.00');
  const [produtividadeSacas, setProdutividadeSacas] = useState(isDemoMode ? '68' : '65');
  const [custoInsumos, setCustoInsumos] = useState(isDemoMode ? '2850' : '2500'); // por ha
  const [custoMaoObra, setCustoMaoObra] = useState(isDemoMode ? '420' : '400'); // por ha
  const [custoFrete, setCustoFrete] = useState(isDemoMode ? '310' : '300'); // por ha
  const [custoImpostos, setCustoImpostos] = useState(isDemoMode ? '180' : '150'); // por ha
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Cálculos reativos instantâneos
  const preco = parseFloat(precoSaca) || 0;
  const prod = parseFloat(produtividadeSacas) || 0;
  const cInsumos = parseFloat(custoInsumos) || 0;
  const cMo = parseFloat(custoMaoObra) || 0;
  const cFrete = parseFloat(custoFrete) || 0;
  const cImp = parseFloat(custoImpostos) || 0;

  const custoTotalHa = cInsumos + cMo + cFrete + cImp;
  const receitaBrutaHa = prod * preco;
  const lucroLiquidoHa = receitaBrutaHa - custoTotalHa;
  const margemPct = receitaBrutaHa > 0 ? (lucroLiquidoHa / receitaBrutaHa) * 100 : 0;
  const breakEvenSacas = preco > 0 ? custoTotalHa / preco : 0;

  const handleSimular = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/operacional/viabilidade/calcular', {
        safra_id: '00000000-0000-0000-0000-000000000001',
        custo_mao_obra: cMo,
        custo_frete: cFrete,
        custo_impostos: cImp,
        preco_mercado_saca: preco,
      });
    } catch (err) {
      console.info('API offline no momento, utilizando cálculo reativo local:', err);
    } finally {
      setLoading(false);
      onSuccess({
        margem: parseFloat(margemPct.toFixed(1)),
        breakEven: parseFloat(breakEvenSacas.toFixed(1)),
      });
      onClose();
    }
  };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
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
                d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
              />
            </svg>
            Simulador de Viabilidade Econômica & Margem
          </div>
          <button className="modal-close" onClick={onClose} title="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSimular}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Safra / Cultura Base</label>
              <CustomSelect
                value={safra}
                onChange={(val) => setSafra(val)}
                options={
                  isDemoMode
                    ? [
                        'Safra 2026/27 - Soja Verão (1.240 ha)',
                        'Safrinha 2027 - Milho (680 ha)',
                      ]
                    : [
                        'Safra Atual - Planejamento',
                        'Simulação Preliminar',
                      ]
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Preço Médio da Saca (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={precoSaca}
                  onChange={(e) => setPrecoSaca(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Produtividade Esperada (sc/ha)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={produtividadeSacas}
                  onChange={(e) => setProdutividadeSacas(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Custo Insumos (R$/ha)</label>
                <input
                  type="number"
                  className="form-input"
                  value={custoInsumos}
                  onChange={(e) => setCustoInsumos(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mão de Obra (R$/ha)</label>
                <input
                  type="number"
                  className="form-input"
                  value={custoMaoObra}
                  onChange={(e) => setCustoMaoObra(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Frete & Logística (R$/ha)</label>
                <input
                  type="number"
                  className="form-input"
                  value={custoFrete}
                  onChange={(e) => setCustoFrete(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tributos / Funrural (R$/ha)</label>
                <input
                  type="number"
                  className="form-input"
                  value={custoImpostos}
                  onChange={(e) => setCustoImpostos(e.target.value)}
                />
              </div>
            </div>

            {/* Painel de Resultados do Simulador */}
            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                marginTop: '6px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Custo Total / ha
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  R$ {custoTotalHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Break-Even Crítico
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '17px', fontWeight: 600, color: 'var(--warning)' }}>
                  {breakEvenSacas.toFixed(1)} <span style={{ fontSize: '12px', fontWeight: 400 }}>sc/ha</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Margem Líquida
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '17px',
                    fontWeight: 600,
                    color: margemPct >= 20 ? 'var(--accent-text)' : 'var(--danger)',
                  }}
                >
                  {margemPct.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Calculando...' : 'Aplicar Cenário ao Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
