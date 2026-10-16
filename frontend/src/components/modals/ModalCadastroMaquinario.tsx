import React, { useState } from 'react';
import { operacionalService, type MaquinarioApi } from '../../services/operacionalService';
import { CustomSelect } from '../ui/CustomSelect';

interface ModalCadastroMaquinarioProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (novaMaquina: MaquinarioApi) => void;
}

const TIPOS_MAQUINA = [
  { value: 'TRATOR', label: 'Trator Agrícola' },
  { value: 'COLHEITADEIRA', label: 'Colheitadeira de Grãos' },
  { value: 'PULVERIZADOR', label: 'Pulverizador Autopropelido' },
  { value: 'PLANTADEIRA', label: 'Plantadeira / Semeadeira' },
  { value: 'CAMINHAO', label: 'Caminhão Graneleiro' },
  { value: 'IMPLEMENTO', label: 'Grade / Subsolador / Implemento' },
];

export const ModalCadastroMaquinario: React.FC<ModalCadastroMaquinarioProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('TRATOR');
  const [horimetro, setHorimetro] = useState('0');
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [intervalo, setIntervalo] = useState('250');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!codigo.trim()) {
      setError('Informe o código ou prefixo da máquina (ex: TR-01, PV-02).');
      return;
    }
    if (!nome.trim()) {
      setError('Informe o modelo e fabricante da máquina.');
      return;
    }

    const horimetroNum = parseFloat(horimetro.replace(',', '.')) || 0;
    const anoNum = parseInt(ano, 10) || new Date().getFullYear();
    const intervaloNum = parseInt(intervalo, 10) || 250;

    setLoading(true);
    try {
      const criado = await operacionalService.createMaquinario({
        nome: `${codigo.trim().toUpperCase()} • ${nome.trim()}`,
        tipo: tipo,
        modelo: nome.trim(),
        ano_fabricacao: anoNum,
        horimetro_atual: horimetroNum,
        intervalo_preventiva: intervaloNum,
        status: 'OPERACIONAL',
      });
      onSuccess(criado);
      setCodigo('');
      setNome('');
      setHorimetro('0');
      onClose();
    } catch (err: unknown) {
      console.warn('Fallback offline para cadastro de máquina:', err);
      const fallbackCriado: MaquinarioApi = {
        id: `maq-${Date.now()}`,
        propriedade_id: 'local',
        nome: `${codigo.trim().toUpperCase()} • ${nome.trim()}`,
        tipo: tipo,
        modelo: nome.trim(),
        ano_fabricacao: anoNum,
        horimetro_atual: horimetroNum,
        intervalo_preventiva: intervaloNum,
        status: 'OPERACIONAL',
      };
      onSuccess(fallbackCriado);
      setCodigo('');
      setNome('');
      setHorimetro('0');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" style={{ width: '20px', height: '20px', color: 'var(--accent)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.75m0 3.75h4.5m-4.5 0h-4.5" />
            </svg>
            Cadastrar Nova Máquina na Frota
          </div>
          <button type="button" className="modal-close" onClick={onClose} title="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--danger-muted)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--danger)',
                  fontSize: '13px',
                }}
              >
                {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group" style={{ flex: '0 0 140px' }}>
                <label className="form-label">
                  Prefixo / Código <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: TR-01"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">
                  Tipo de Maquinário <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <CustomSelect
                  value={tipo}
                  onChange={setTipo}
                  options={TIPOS_MAQUINA}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Modelo & Marca / Fabricante <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: John Deere 8370R ou Case IH Magnum 380"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Horímetro Atual (h)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="form-input"
                  placeholder="0"
                  value={horimetro}
                  onChange={(e) => setHorimetro(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ano Fabricação</label>
                <input
                  type="number"
                  min="1970"
                  max={new Date().getFullYear() + 1}
                  className="form-input"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Intervalo Revisão (h)</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  className="form-input"
                  value={intervalo}
                  onChange={(e) => setIntervalo(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>{loading ? 'Salvando Máquina...' : 'Cadastrar Máquina'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
