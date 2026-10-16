import React, { useState, useEffect } from 'react';
import { useAuth, type Propriedade, type Usuario } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { api } from '../api/client';
import { CustomSelect } from '../components/ui/CustomSelect';

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

const ROLES_INFO: Record<string, { label: string; bg: string; color: string; desc: string }> = {
  ADMIN: {
    label: 'Administrador Geral',
    bg: 'rgba(168, 85, 247, 0.15)',
    color: '#c084fc',
    desc: 'Controle total da fazenda, membros, relatórios e parâmetros fiscais.',
  },
  GESTOR: {
    label: 'Gerente Agrícola',
    bg: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    desc: 'Gestão de safras, talhões, insumos, maquinários e viabilidade.',
  },
  OPERADOR: {
    label: 'Operador de Campo / Frota',
    bg: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
    desc: 'Registro de atividades de máquinas, manutenção e entrada de insumos.',
  },
  CONSULTOR: {
    label: 'Consultor / Agrônomo',
    bg: 'rgba(245, 158, 11, 0.15)',
    color: '#fbbf24',
    desc: 'Vigilância sanitária, laudos de infestação e auditoria ESG.',
  },
};

const DEFAULT_DEMO_MEMBROS: Usuario[] = [
  {
    id: 'user-demo-1',
    email: 'rafael.costa@santamaria.com.br',
    nome_completo: 'Rafael Costa (Você)',
    propriedade_id: '00000000-0000-0000-0000-000000000001',
    role: 'ADMIN',
    ativo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'user-demo-2',
    email: 'marcos.silva@santamaria.com.br',
    nome_completo: 'Marcos Silva',
    propriedade_id: '00000000-0000-0000-0000-000000000001',
    role: 'GESTOR',
    ativo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'user-demo-3',
    email: 'dra.helena@consultoria-agro.com',
    nome_completo: 'Dra. Helena Martins (Agrônoma)',
    propriedade_id: '00000000-0000-0000-0000-000000000001',
    role: 'CONSULTOR',
    ativo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'user-demo-4',
    email: 'joao.tratorista@santamaria.com.br',
    nome_completo: 'João Paulo de Oliveira',
    propriedade_id: '00000000-0000-0000-0000-000000000001',
    role: 'OPERADOR',
    ativo: true,
    created_at: new Date().toISOString(),
  },
];

export const Configuracoes: React.FC = () => {
  const { propriedade, carregarPropriedade, token } = useAuth();
  const { isOnline, isSyncing, syncNow, lastSyncAt, pendingCount } = useSync();

  const [activeTab, setActiveTab] = useState<'FAZENDA' | 'EQUIPE' | 'PWA'>('FAZENDA');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Estados dos dados da fazenda
  const [nomeFazenda, setNomeFazenda] = useState(propriedade?.nome || '');
  const [municipio, setMunicipio] = useState(propriedade?.municipio || '');
  const [estado, setEstado] = useState(propriedade?.estado || 'MT');
  const [areaTotal, setAreaTotal] = useState(propriedade?.area_total_hectares?.toString() || '');
  const [cnpjCpf, setCnpjCpf] = useState(propriedade?.cnpj_cpf || '');
  const [inscricaoEstadual, setInscricaoEstadual] = useState(propriedade?.inscricao_estadual || '');
  const [carNumero, setCarNumero] = useState(propriedade?.car_numero || '');
  const [salvandoFazenda, setSalvandoFazenda] = useState(false);

  // Estados da equipe de membros
  const [membros, setMembros] = useState<Usuario[]>(DEFAULT_DEMO_MEMBROS);
  const [carregandoMembros, setCarregandoMembros] = useState(false);
  const [showModalMembro, setShowModalMembro] = useState(false);

  // Campos do novo membro
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoRole, setNovoRole] = useState('GESTOR');
  const [salvandoMembro, setSalvandoMembro] = useState(false);
  const [erroMembro, setErroMembro] = useState<string | null>(null);

  // Estado PWA
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Sincroniza formulário com dados da propriedade do contexto
  useEffect(() => {
    if (propriedade) {
      setNomeFazenda(propriedade.nome || '');
      setMunicipio(propriedade.municipio || '');
      setEstado(propriedade.estado || 'MT');
      setAreaTotal(propriedade.area_total_hectares?.toString() || '');
      setCnpjCpf(propriedade.cnpj_cpf || '');
      setInscricaoEstadual(propriedade.inscricao_estadual || '');
      setCarNumero(propriedade.car_numero || '');
    }
  }, [propriedade]);

  // Carrega lista de membros do backend
  useEffect(() => {
    async function fetchMembros() {
      if (!token || token === 'demo-token') {
        const saved = localStorage.getItem('seed_demo_membros');
        if (saved) setMembros(JSON.parse(saved));
        return;
      }
      setCarregandoMembros(true);
      try {
        const res = await api.get<Usuario[]>('/propriedades/minha/membros');
        if (Array.isArray(res) && res.length > 0) {
          setMembros(res);
        }
      } catch (err) {
        console.warn('Erro ao carregar membros da API, mantendo lista local:', err);
      } finally {
        setCarregandoMembros(false);
      }
    }
    fetchMembros();
  }, [token]);

  // Event listener para detecção do instalador PWA
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
      showToast('Aplicativo Seed instalado com sucesso no seu dispositivo!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Salvar alterações da propriedade
  const handleSalvarFazenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvandoFazenda(true);

    const payload = {
      nome: nomeFazenda.trim(),
      municipio: municipio.trim(),
      estado,
      area_total_hectares: areaTotal ? parseFloat(areaTotal) : null,
      cnpj_cpf: cnpjCpf.trim() || null,
      inscricao_estadual: inscricaoEstadual.trim() || null,
      car_numero: carNumero.trim() || null,
    };

    try {
      if (token && token !== 'demo-token') {
        await api.patch('/propriedades/minha', payload);
        await carregarPropriedade();
      } else {
        // Fallback modo demo
        const propAtualizada: Propriedade = {
          id: propriedade?.id || 'demo-prop',
          ...payload,
        };
        localStorage.setItem('seed_propriedade', JSON.stringify(propAtualizada));
      }
      showToast('Configurações da fazenda atualizadas com sucesso!');
    } catch (err: unknown) {
      console.error(err);
      showToast('Erro ao atualizar configurações. Verifique a conexão com o servidor.');
    } finally {
      setSalvandoFazenda(false);
    }
  };

  // Convidar novo membro
  const handleAdicionarMembro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroMembro(null);

    if (!novoNome.trim() || !novoEmail.trim() || !novaSenha.trim()) {
      setErroMembro('Preencha todos os campos obrigatórios.');
      return;
    }

    if (novaSenha.length < 8) {
      setErroMembro('A senha provisória deve conter no mínimo 8 caracteres.');
      return;
    }

    setSalvandoMembro(true);

    try {
      if (token && token !== 'demo-token') {
        const novo = await api.post<Usuario>('/propriedades/minha/membros', {
          nome_completo: novoNome.trim(),
          email: novoEmail.trim(),
          senha: novaSenha,
          role: novoRole,
        });
        setMembros((prev) => [...prev, novo]);
      } else {
        const novoSimulado: Usuario = {
          id: `membro-${Date.now()}`,
          nome_completo: novoNome.trim(),
          email: novoEmail.trim(),
          propriedade_id: propriedade?.id || 'demo-prop',
          role: novoRole,
          ativo: true,
          created_at: new Date().toISOString(),
        };
        setMembros((prev) => {
          const lista = [...prev, novoSimulado];
          localStorage.setItem('seed_demo_membros', JSON.stringify(lista));
          return lista;
        });
      }

      showToast(`Membro "${novoNome}" adicionado à equipe com sucesso!`);
      setShowModalMembro(false);
      setNovoNome('');
      setNovoEmail('');
      setNovaSenha('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErroMembro(err.message || 'Erro ao adicionar membro.');
      } else {
        setErroMembro('Falha ao adicionar colaborador na propriedade.');
      }
    } finally {
      setSalvandoMembro(false);
    }
  };

  // Alternar ativação de membro
  const handleToggleMembro = async (membro: Usuario) => {
    const novoStatus = !membro.ativo;
    try {
      if (token && token !== 'demo-token') {
        await api.patch(`/propriedades/minha/membros/${membro.id}`, {
          ativo: novoStatus,
        });
      }
      setMembros((prev) =>
        prev.map((m) => (m.id === membro.id ? { ...m, ativo: novoStatus } : m))
      );
      showToast(
        `Acesso do colaborador ${membro.nome_completo} ${novoStatus ? 'reativado' : 'suspenso'}.`
      );
    } catch {
      showToast('Não foi possível alterar o status do colaborador no momento.');
    }
  };

  // Instalar PWA
  const handleInstallPwa = async () => {
    if (!deferredPrompt) {
      showToast('O aplicativo já está instalado ou seu navegador não suporta o prompt direto.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsPwaInstalled(true);
      showToast('Instalação aceita com sucesso!');
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="page-content" style={{ padding: '28px 36px', maxWidth: '1200px', margin: '0 auto' }}>
      {toastMsg && (
        <div className="toast-msg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            style={{ width: '18px', height: '18px', color: 'var(--accent)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Cabeçalho da Página */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-heading" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              style={{ width: '26px', height: '26px', color: 'var(--accent)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Configurações da Fazenda & Governança
          </h1>
          <p className="page-subheading">
            Gestão cadastral, equipe de colaboradores com controle de acesso RBAC e aplicativo de campo.
          </p>
        </div>
      </div>

      {/* Seletor de Abas Executivo */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '28px',
          paddingBottom: '2px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('FAZENDA')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'FAZENDA' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'FAZENDA' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'FAZENDA' ? 600 : 500,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 150ms ease',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
          Dados da Propriedade
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EQUIPE')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'EQUIPE' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'EQUIPE' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'EQUIPE' ? 600 : 500,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 150ms ease',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          Equipe & Colaboradores ({membros.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PWA')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'PWA' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'PWA' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'PWA' ? 600 : 500,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 150ms ease',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
          Modo Offline & Aplicativo de Campo (PWA)
        </button>
      </div>

      {/* ABA 1: DADOS DA FAZENDA */}
      {activeTab === 'FAZENDA' && (
        <div style={{ maxWidth: '820px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Ficha Cadastral da Propriedade Rural
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Essas informações identificam sua fazenda em relatórios executivos em PDF e matrizes de auditoria.
              </p>
            </div>

            <form onSubmit={handleSalvarFazenda} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nome Oficial da Fazenda / Propriedade</label>
                <input
                  type="text"
                  className="form-input"
                  value={nomeFazenda}
                  onChange={(e) => setNomeFazenda(e.target.value)}
                  placeholder="Ex: Fazenda Santa Maria"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Município</label>
                  <input
                    type="text"
                    className="form-input"
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    placeholder="Ex: Sorriso"
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
                  <label className="form-label">Área Total Consolidada (Hectares)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={areaTotal}
                    onChange={(e) => setAreaTotal(e.target.value)}
                    placeholder="Ex: 1420"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CNPJ ou CPF do Produtor Titular</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cnpjCpf}
                    onChange={(e) => setCnpjCpf(e.target.value)}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Inscrição Estadual (IE)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={inscricaoEstadual}
                    onChange={(e) => setInscricaoEstadual(e.target.value)}
                    placeholder="Ex: 13.987.654-3"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Número do CAR (Cadastro Ambiental Rural)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={carNumero}
                    onChange={(e) => setCarNumero(e.target.value)}
                    placeholder="MT-5107909-123456789..."
                  />
                </div>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={salvandoFazenda}
                  className="btn btn-primary"
                  style={{ minWidth: '180px', justifyContent: 'center' }}
                >
                  {salvandoFazenda ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ABA 2: EQUIPE & RBAC */}
      {activeTab === 'EQUIPE' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Colaboradores da Fazenda ({membros.length})
                {carregandoMembros && <span className="sync-dot" title="Atualizando equipe..." />}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Controle de acesso por função (Role-Based Access Control) para operadores, agrônomos e gestores.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setShowModalMembro(true);
                setErroMembro(null);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Convidar Colaborador
            </button>
          </div>

          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                    Nome & E-mail
                  </th>
                  <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                    Papel / Permissões
                  </th>
                  <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {membros.map((m) => {
                  const roleStyle = ROLES_INFO[m.role] || ROLES_INFO.OPERADOR;
                  return (
                    <tr
                      key={m.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 120ms ease',
                        opacity: m.ativo ? 1 : 0.5,
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.nome_completo}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{m.email}</div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: roleStyle.bg,
                            color: roleStyle.color,
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {roleStyle.label}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {roleStyle.desc}
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            color: m.ativo ? '#10b981' : 'var(--text-muted)',
                            fontWeight: 500,
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: m.ativo ? '#10b981' : '#71717a',
                            }}
                          />
                          {m.ativo ? 'Acesso Ativo' : 'Acesso Suspenso'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleMembro(m)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            color: m.ativo ? 'var(--text-muted)' : 'var(--accent-text)',
                            fontSize: '11px',
                            padding: '5px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                          }}
                        >
                          {m.ativo ? 'Suspender' : 'Reativar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: PWA & MODO OFFLINE */}
      {activeTab === 'PWA' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Aplicativo Nativo de Campo (PWA)
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
              Instale o Seed diretamente na cabine do trator, colheitadeira ou no smartphone dos operadores. O aplicativo funciona mesmo quando o sinal 4G falha nos talhões distantes da sede.
            </p>

            <div
              style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: isPwaInstalled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  display: 'grid',
                  placeItems: 'center',
                  color: isPwaInstalled ? '#10b981' : 'var(--text-muted)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13.5px' }}>
                  {isPwaInstalled ? 'Aplicativo Instalado no Dispositivo' : 'Disponível para Instalação Nativa'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {isPwaInstalled
                    ? 'Rodando como Web App independente com aceleração local.'
                    : 'Instale para acesso com um clique na tela inicial sem barras de navegador.'}
                </div>
              </div>
            </div>

            {!isPwaInstalled && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleInstallPwa}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Instalar Aplicativo no Dispositivo
              </button>
            )}
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Motor de Sincronização (SyncEngine)
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Monitoramento dos envelopes de sincronização entre o banco local e a nuvem.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Conectividade:</span>
                <span style={{ fontWeight: 600, color: isOnline ? '#10b981' : '#f59e0b' }}>
                  {isOnline ? 'Online (Nuvem Ativa)' : 'Offline (Gravando Local)'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fila de Envelopes Pendentes:</span>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {pendingCount} registros
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Última Sincronização:</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {lastSyncAt || 'Agora há pouco'}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                syncNow();
                showToast('Sincronização forçada iniciada!');
              }}
              disabled={isSyncing}
              style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}
            >
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Dados Agora'}
            </button>
          </div>
        </div>
      )}

      {/* Modal de Convidar Novo Membro */}
      {showModalMembro && (
        <div className="modal-backdrop open" onClick={() => setShowModalMembro(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                </svg>
                Convidar Colaborador para a Fazenda
              </div>
              <button className="modal-close" onClick={() => setShowModalMembro(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAdicionarMembro}>
              <div className="modal-body" style={{ gap: '14px' }}>
                {erroMembro && (
                  <div style={{ padding: '10px 14px', background: 'var(--danger-muted)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                    {erroMembro}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input
                    type="text"
                    className="form-input"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: João Paulo de Oliveira"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">E-mail de Acesso</label>
                  <input
                    type="email"
                    className="form-input"
                    value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)}
                    placeholder="colaborador@fazenda.com.br"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Papel / Função na Propriedade</label>
                  <CustomSelect
                    value={novoRole}
                    onChange={(val) => setNovoRole(val)}
                    options={[
                      { value: 'GESTOR', label: 'Gerente Agrícola (Gestão Operacional)' },
                      { value: 'OPERADOR', label: 'Operador de Frota / Campo' },
                      { value: 'CONSULTOR', label: 'Consultor Técnico / Agrônomo' },
                      { value: 'ADMIN', label: 'Administrador Geral da Fazenda' },
                    ]}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Senha Provisória de Acesso (mínimo 8 dígitos)</label>
                  <input
                    type="password"
                    className="form-input"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModalMembro(false)}>
                  Cancelar
                </button>
                <button type="submit" disabled={salvandoMembro} className="btn btn-primary">
                  {salvandoMembro ? 'Salvando...' : 'Adicionar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
