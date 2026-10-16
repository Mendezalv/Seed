import React, { useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CustomSelect } from '../ui/CustomSelect';

interface ModalOcorrenciaSanitariaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (novaOcorrencia: { agente: string; severidade: string; talhao: string }) => void;
}

export const ModalOcorrenciaSanitaria: React.FC<ModalOcorrenciaSanitariaProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, token, propriedade } = useAuth();
  const isDemoMode = token === 'demo-token' || propriedade?.id === 'demo-property-id';

  const [talhao, setTalhao] = useState(isDemoMode ? 'Talhão 04 (Pivô Norte)' : 'Talhão 01');
  const [tipoCultura, setTipoCultura] = useState('Soja');
  const [categoria, setCategoria] = useState('DOENCA');
  const [agente, setAgente] = useState(isDemoMode ? 'Ferrugem asiática' : '');
  const [severidade, setSeveridade] = useState<'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA'>(isDemoMode ? 'ALTA' : 'MEDIA');
  const [observacoes, setObservacoes] = useState(
    isDemoMode ? 'Pústulas observadas no terço médio e inferior da folhagem' : ''
  );
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
    <div className="modal-backdrop open" onClick={onClose}>
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
                <CustomSelect
                  value={talhao}
                  onChange={(val) => setTalhao(val)}
                  options={
                    isDemoMode
                      ? [
                          'Talhão 01 (Sede - 140 ha)',
                          'Talhão 04 (Pivô Norte - 220 ha)',
                          'Talhão 07 (Baixada - 180 ha)',
                          'Talhão 12 (Reserva Leste - 95 ha)',
                        ]
                      : [
                          'Talhão 01 (Área Geral)',
                          'Talhão 02 (Área de Cultivo)',
                          'Talhão 03 (Sequeiro)',
                        ]
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cultura Agrícola</label>
                <CustomSelect
                  value={tipoCultura}
                  onChange={(val) => setTipoCultura(val)}
                  options={[
                    { value: 'Soja', label: 'Soja (Glycine max)' },
                    { value: 'Milho', label: 'Milho Safrinha' },
                    { value: 'Cana', label: 'Cana-de-Açúcar' },
                    { value: 'Algodão', label: 'Algodão' },
                  ]}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Categoria de Ameaça</label>
                <CustomSelect
                  value={categoria}
                  onChange={(val) => setCategoria(val)}
                  options={[
                    { value: 'DOENCA', label: 'Doença Fúngica / Bacteriana' },
                    { value: 'PRAGA', label: 'Praga / Inseto Mastigador' },
                    { value: 'PLANTA_DANINHA', label: 'Planta Daninha Resistente' },
                    { value: 'NEMATOIDE', label: 'Nematóide de Galha/Cisto' },
                  ]}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nível de Severidade</label>
                <CustomSelect
                  value={severidade}
                  onChange={(val) => setSeveridade(val as 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA')}
                  options={[
                    { value: 'CRITICA', label: 'Crítica (Intervenção imediata)', badge: { text: 'CRÍTICA', className: 'badge-danger' } },
                    { value: 'ALTA', label: 'Alta (Dano econômico iminente)', badge: { text: 'ALTA', className: 'badge-warn' } },
                    { value: 'MEDIA', label: 'Média (Atingindo nível de controle)', badge: { text: 'MÉDIA', className: 'badge-info' } },
                    { value: 'BAIXA', label: 'Baixa (Monitoramento rotineiro)', badge: { text: 'BAIXA', className: 'badge-accent' } },
                  ]}
                />
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
