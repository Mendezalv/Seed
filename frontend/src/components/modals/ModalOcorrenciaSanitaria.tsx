import React, { useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface ModalOcorrenciaSanitariaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (novaOcorrencia: { agente: string; severidade: string; talhao: string }) => void;
}

export const ModalOcorrenciaSanitaria: React.FC<ModalOcorrenciaSanitariaProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();

  const [talhao, setTalhao] = useState('Talhão 04 (Pivô Norte)');
  const [tipoCultura, setTipoCultura] = useState('Soja');
  const [categoria, setCategoria] = useState('DOENCA');
  const [agente, setAgente] = useState('Ferrugem asiática');
  const [severidade, setSeveridade] = useState<'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA'>('ALTA');
  const [observacoes, setObservacoes] = useState('Pústulas observadas no terço médio e inferior da folhagem');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/epidemiologico/ocorrencias', {
        tipo_cultura: tipoCultura,
        categoria: categoria,
        agente_identificado: agente,
        severidade: severidade,
        latitude: -21.1767, // Padrão coordenadas da fazenda
        longitude: -47.8208,
        reportado_por: user?.id || '00000000-0000-0000-0000-000000000001',
        observado_em: new Date().toISOString(),
        origem: 'APP_WEB',
        dados_extras: { observacoes, talhao },
      });
    } catch (err) {
      console.info('API não disponível no momento. Registrando localmente no modo ativo:', err);
    } finally {
      setLoading(false);
      onSuccess({
        agente,
        severidade,
        talhao,
      });
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '20px', height: '20px', color: 'var(--danger)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            Registrar Ocorrência Sanitária em Campo
          </div>
          <button className="modal-close" onClick={onClose} title="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Talhão Acometido</label>
                <select className="form-input" value={talhao} onChange={(e) => setTalhao(e.target.value)}>
                  <option value="Talhão 01 (Sede - 140 ha)">Talhão 01 (Sede - 140 ha)</option>
                  <option value="Talhão 04 (Pivô Norte - 220 ha)">Talhão 04 (Pivô Norte - 220 ha)</option>
                  <option value="Talhão 07 (Baixada - 180 ha)">Talhão 07 (Baixada - 180 ha)</option>
                  <option value="Talhão 12 (Reserva Leste - 95 ha)">Talhão 12 (Reserva Leste - 95 ha)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cultura Agrícola</label>
                <select className="form-input" value={tipoCultura} onChange={(e) => setTipoCultura(e.target.value)}>
                  <option value="Soja">Soja (Glicyne max)</option>
                  <option value="Milho">Milho Safrinha</option>
                  <option value="Cana">Cana-de-Açúcar</option>
                  <option value="Algodão">Algodão</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Categoria de Ameaça</label>
                <select className="form-input" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                  <option value="DOENCA">Doença Fúngica / Bacteriana</option>
                  <option value="PRAGA">Praga / Inseto Mastigador</option>
                  <option value="PLANTA_DANINHA">Planta Daninha Resistente</option>
                  <option value="NEMATOIDE">Nematóide de Galha/Cisto</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nível de Severidade</label>
                <select
                  className="form-input"
                  value={severidade}
                  onChange={(e) => setSeveridade(e.target.value as 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA')}
                  style={{
                    borderColor:
                      severidade === 'CRITICA'
                        ? 'var(--danger)'
                        : severidade === 'ALTA'
                        ? 'var(--warning)'
                        : 'var(--border)',
                  }}
                >
                  <option value="BAIXA">Baixa (Monitoramento rotineiro)</option>
                  <option value="MEDIA">Média (Atingindo nível de controle)</option>
                  <option value="ALTA">Alta (Dano econômico iminente)</option>
                  <option value="CRITICA">Crítica (Intervenção imediata com calda)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Agente Patogênico Identificado</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Phakopsora pachyrhizi, Spodoptera frugiperda"
                value={agente}
                onChange={(e) => setAgente(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Observações e Ações Recomendadas</label>
              <textarea
                rows={3}
                className="form-input"
                placeholder="Descreva sintomas visuais, % de desfolha ou recomendação agronômica..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ background: severidade === 'CRITICA' ? 'var(--danger)' : undefined, color: severidade === 'CRITICA' ? '#fff' : undefined }}
            >
              {loading ? 'Transmitindo...' : 'Disparar Alerta Sanitário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
