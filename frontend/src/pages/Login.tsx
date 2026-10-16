import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
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
                marginTop: '8px',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Autenticando...' : 'Entrar no Sistema'}
            </button>

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
