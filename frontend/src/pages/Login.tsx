import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, registrar, loginDemo } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'CADASTRO'>('LOGIN');

  // Campos de Login
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Campos de Cadastro
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [nomePropriedade, setNomePropriedade] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, senha);
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Erro ao realizar login.');
      } else {
        setError('Falha ao autenticar.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nomeCompleto.trim()) {
      setError('Informe seu nome completo.');
      return;
    }
    if (!emailCadastro.trim()) {
      setError('Informe seu e-mail corporativo.');
      return;
    }
    if (senhaCadastro.length < 8) {
      setError('A senha deve conter no mínimo 8 caracteres.');
      return;
    }
    if (!nomePropriedade.trim()) {
      setError('Informe o nome da sua fazenda ou propriedade.');
      return;
    }

    setLoading(true);
    try {
      await registrar({
        nome_completo: nomeCompleto.trim(),
        email: emailCadastro.trim(),
        senha: senhaCadastro,
        nome_propriedade: nomePropriedade.trim(),
      });
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Erro ao cadastrar nova fazenda.');
      } else {
        setError('Falha ao cadastrar propriedade. Verifique os dados e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.15fr 1fr',
        minHeight: '100dvh',
        background: 'var(--bg-primary)',
      }}
      className="auth-container"
    >
      {/* Lado Esquerdo: Brand Showcase */}
      <div
        className="auth-brand-side"
        style={{
          background: '#09090b',
          borderRight: '1px solid var(--border)',
          padding: '56px 64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'var(--accent)',
              borderRadius: '9px',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <svg viewBox="0 0 256 256" width="24" height="24" fill="#09090B" role="img" aria-label="Seed Logo">
              <path d="M 120 28 A 100 100 0 0 0 28 120 L 60 120 A 68 68 0 0 1 120 60 Z" />
              <path d="M 136 60 A 68 68 0 0 1 196 120 L 228 120 A 100 100 0 0 0 136 28 Z" />
              <path d="M 60 136 L 28 136 A 100 100 0 0 0 120 228 L 120 196 A 68 68 0 0 1 60 136 Z" />
              <path d="M 196 136 A 68 68 0 0 1 136 196 L 136 228 A 100 100 0 0 0 228 136 Z" />
              <path d="M 128 72 C 142 98 154 118 154 132 C 154 146 142 158 128 158 C 114 158 102 146 102 132 C 102 118 114 98 128 72 Z" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Seed
            </span>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Agro Intelligence
            </span>
          </div>
        </div>

        <div style={{ maxWidth: '520px', margin: 'auto 0' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: '-0.03em',
              marginBottom: '16px',
            }}
          >
            Hub Executivo de Gestão e Inteligência Agropecuária.
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '36px',
            }}
          >
            Controle de ponta a ponta: do mosaico de talhões com GIS e custos de insumos à vigilância
            sanitária e indicadores de balanço de carbono ESG.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'var(--accent-text)',
                  marginBottom: '4px',
                }}
              >
                1.420 ha
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Área monitorada com precisão GIS
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'var(--accent-text)',
                  marginBottom: '4px',
                }}
              >
                -412 tCO₂e
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Balanço de carbono negativo
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          © 2026 Seed Plataforma Agro • Versão 0.1.0
        </div>
      </div>

      {/* Lado Direito: Formulário */}
      <div
        className="auth-form-side"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Seletor de Abas: Login vs Cadastro */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'var(--bg-elevated)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setError(null);
              }}
              style={{
                padding: '9px 12px',
                border: 'none',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                fontSize: '13px',
                fontWeight: mode === 'LOGIN' ? 600 : 500,
                background: mode === 'LOGIN' ? 'var(--bg-surface)' : 'transparent',
                color: mode === 'LOGIN' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode === 'LOGIN' ? '0 2px 6px rgba(0, 0, 0, 0.4)' : 'none',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('CADASTRO');
                setError(null);
              }}
              style={{
                padding: '9px 12px',
                border: 'none',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                fontSize: '13px',
                fontWeight: mode === 'CADASTRO' ? 600 : 500,
                background: mode === 'CADASTRO' ? 'var(--bg-surface)' : 'transparent',
                color: mode === 'CADASTRO' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode === 'CADASTRO' ? '0 2px 6px rgba(0, 0, 0, 0.4)' : 'none',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              Cadastrar Fazenda
            </button>
          </div>

          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '6px' }}>
              {mode === 'LOGIN' ? 'Acesso à Plataforma' : 'Cadastrar Nova Fazenda'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {mode === 'LOGIN'
                ? 'Entre com suas credenciais para gerenciar sua propriedade rural.'
                : 'Crie sua conta de gestor e comece a operar sua fazenda no ecossistema Seed.'}
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '12px 14px',
                background: 'var(--danger-muted)',
                border: '1px solid var(--danger)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--danger)',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}

          {mode === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  E-mail Institucional
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@fazenda.com.br"
                  required
                  style={{
                    width: '100%',
                    height: '42px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0 12px',
                    color: 'var(--text-primary)',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    Senha de Acesso
                  </label>
                  <Link
                    to="/recuperar-senha"
                    style={{ color: 'var(--accent-text)', fontSize: '11.5px', textDecoration: 'none' }}
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    height: '42px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0 12px',
                    color: 'var(--text-primary)',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  height: '42px',
                  justifyContent: 'center',
                  fontSize: '14px',
                  marginTop: '6px',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Autenticando...' : 'Entrar no Sistema'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Ainda não tem uma fazenda cadastrada?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('CADASTRO');
                    setError(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-text)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '12.5px',
                  }}
                >
                  Cadastrar agora
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ou</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>

              <button
                type="button"
                onClick={() => {
                  loginDemo();
                  navigate('/');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 160ms ease',
                }}
                title="Acessar com perfil institucional demonstrativo (Fazenda Santa Maria)"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Acessar Demonstração da Fazenda Modelo</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  Nome Completo do Produtor / Gestor <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Mendes"
                  required
                  style={{
                    width: '100%',
                    height: '40px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0 12px',
                    color: 'var(--text-primary)',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  Nome da Fazenda / Propriedade Rural <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={nomePropriedade}
                  onChange={(e) => setNomePropriedade(e.target.value)}
                  placeholder="Ex: Fazenda Boa Esperança"
                  required
                  style={{
                    width: '100%',
                    height: '40px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0 12px',
                    color: 'var(--text-primary)',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  E-mail Corporativo ou Pessoal <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  type="email"
                  value={emailCadastro}
                  onChange={(e) => setEmailCadastro(e.target.value)}
                  placeholder="produtor@fazenda.com.br"
                  required
                  style={{
                    width: '100%',
                    height: '40px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0 12px',
                    color: 'var(--text-primary)',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  Criar Senha de Acesso (mínimo 8 dígitos) <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  type="password"
                  value={senhaCadastro}
                  onChange={(e) => setSenhaCadastro(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    height: '40px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0 12px',
                    color: 'var(--text-primary)',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  height: '42px',
                  justifyContent: 'center',
                  fontSize: '14px',
                  marginTop: '6px',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Criando Fazenda...' : 'Cadastrar Fazenda e Acessar'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Já possui uma conta registrada?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('LOGIN');
                    setError(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-text)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '12.5px',
                  }}
                >
                  Fazer login
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ou</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>

              <button
                type="button"
                onClick={() => {
                  loginDemo();
                  navigate('/');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 160ms ease',
                }}
                title="Acessar com perfil institucional demonstrativo (Fazenda Santa Maria)"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Acessar Demonstração da Fazenda Modelo</span>
              </button>
            </form>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              style={{ width: '13px', height: '13px', color: 'var(--text-secondary)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            Conexão Criptografada ponta a ponta (TLS 1.3)
          </div>
        </div>
      </div>
    </div>
  );
};
