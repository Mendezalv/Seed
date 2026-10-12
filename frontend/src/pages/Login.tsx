import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginDemo } = useAuth();

  const [email, setEmail] = useState('admin@seed.com');
  const [senha, setSenha] = useState('SenhaForte123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
              width: '32px',
              height: '32px',
              background: 'var(--accent)',
              borderRadius: '8px',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              fontSize: '14px',
              color: '#000',
            }}
          >
            S
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
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '6px' }}>
              Acesso à Plataforma
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              Entre com suas credenciais para gerenciar a propriedade.
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                <a
                  href="#recuperar"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Recuperação de senha: entre em contato com o suporte ou seu gestor de tenant.');
                  }}
                  style={{ color: 'var(--accent-text)', fontSize: '11.5px', textDecoration: 'none' }}
                >
                  Esqueceu a senha?
                </a>
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
                marginTop: '8px',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Autenticando...' : 'Entrar no Sistema'}
            </button>

            <button
              type="button"
              onClick={() => {
                loginDemo();
                navigate('/');
              }}
              style={{
                background: 'transparent',
                border: '1px dashed var(--border)',
                color: 'var(--text-muted)',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 160ms ease',
              }}
              title="Acessar com perfil simulado para navegação e testes de UI"
            >
              Acesso Rápido em Modo Demonstração (UI Mock)
            </button>
          </form>

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
