import React, { useState } from 'react';
import { useAuth, type Propriedade } from '../../context/AuthContext';
import { CustomSelect } from '../ui/CustomSelect';

interface ModalCadastroFazendaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (novaPropriedade: Propriedade) => void;
}

const ESTADOS_BRASIL = [
  { value: 'MT', label: 'Mato Grosso (MT)' },
  { value: 'GO', label: 'Goiás (GO)' },
  { value: 'MS', label: 'Mato Grosso do Sul (MS)' },
  { value: 'PR', label: 'Paraná (PR)' },
  { value: 'RS', label: 'Rio Grande do Sul (RS)' },
  { value: 'BA', label: 'Bahia (BA)' },
  { value: 'MG', label: 'Minas Gerais (MG)' },
  { value: 'SP', label: 'São Paulo (SP)' },
  { value: 'TO', label: 'Tocantins (TO)' },
  { value: 'MA', label: 'Maranhão (MA)' },
  { value: 'PI', label: 'Piauí (PI)' },
  { value: 'PA', label: 'Pará (PA)' },
  { value: 'RO', label: 'Rondônia (RO)' },
  { value: 'SC', label: 'Santa Catarina (SC)' },
  { value: 'ES', label: 'Espírito Santo (ES)' },
  { value: 'DF', label: 'Distrito Federal (DF)' },
  { value: 'AC', label: 'Acre (AC)' },
  { value: 'AL', label: 'Alagoas (AL)' },
  { value: 'AM', label: 'Amazonas (AM)' },
  { value: 'AP', label: 'Amapá (AP)' },
  { value: 'CE', label: 'Ceará (CE)' },
  { value: 'PB', label: 'Paraíba (PB)' },
  { value: 'PE', label: 'Pernambuco (PE)' },
  { value: 'RN', label: 'Rio Grande do Norte (RN)' },
  { value: 'RR', label: 'Roraima (RR)' },
  { value: 'SE', label: 'Sergipe (SE)' },
];

export const ModalCadastroFazenda: React.FC<ModalCadastroFazendaProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { cadastrarPropriedade } = useAuth();

  const [nome, setNome] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [estado, setEstado] = useState('MT');
  const [areaHectares, setAreaHectares] = useState('');
  const [cnpjCpf, setCnpjCpf] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');
  const [carNumero, setCarNumero] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nome.trim()) {
      setError('Informe o nome da fazenda ou propriedade.');
      return;
    }

    if (!municipio.trim()) {
      setError('Informe o município da propriedade.');
      return;
    }

    const areaNum = parseFloat(areaHectares);
    if (isNaN(areaNum) || areaNum <= 0) {
      setError('Informe uma área total válida em hectares.');
      return;
    }

    setLoading(true);

    try {
      const nova = await cadastrarPropriedade({
        nome: nome.trim(),
        municipio: municipio.trim(),
        estado,
        area_total_hectares: areaNum,
        cnpj_cpf: cnpjCpf.trim() || undefined,
        inscricao_estadual: inscricaoEstadual.trim() || undefined,
        car_numero: carNumero.trim() || undefined,
      });

      onSuccess(nova);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError('Não foi possível cadastrar a propriedade. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              style={{ width: '22px', height: '22px', color: 'var(--accent)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5"
              />
            </svg>
            Cadastrar Nova Fazenda / Propriedade Rural
          </div>
          <button className="modal-close" onClick={onClose} title="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ gap: '14px' }}>
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'var(--danger-muted)',
                  color: 'var(--danger)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Nome da Fazenda / Propriedade <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Fazenda Primavera, Estância Boa Vista..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">
                  Município <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Sorriso, Rio Verde, Cascavel..."
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1.2 }}>
                <label className="form-label">Estado (UF)</label>
                <CustomSelect
                  value={estado}
                  onChange={(val) => setEstado(val)}
                  options={ESTADOS_BRASIL}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Área Total (Hectares) <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="form-input"
                  placeholder="Ex: 1450"
                  value={areaHectares}
                  onChange={(e) => setAreaHectares(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">CPF ou CNPJ do Produtor</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="00.000.000/0001-00"
                  value={cnpjCpf}
                  onChange={(e) => setCnpjCpf(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Inscrição Estadual (IE)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: 13.456.789-0"
                  value={inscricaoEstadual}
                  onChange={(e) => setInscricaoEstadual(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nº CAR (Cadastro Ambiental Rural)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="MT-5107909-..."
                  value={carNumero}
                  onChange={(e) => setCarNumero(e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                fontSize: '11.5px',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              Ao cadastrar, a nova propriedade será ativada imediatamente para a sua conta e você poderá lançar talhões, insumos, maquinários e emitir relatórios executivos.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar e Ativar Fazenda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
