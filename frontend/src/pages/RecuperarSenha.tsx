import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { SeedBrandLogo } from '../components/common/SeedBrandLogo';

export const RecuperarSenha: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setMensagemSucesso(null);
    setLoading(true);

    try {
      const res = await api.post<{ mensagem: string; sucesso: boolean }>('/auth/recuperar-senha', { email });
      setMensagemSucesso(res.mensagem || 'Instruções para redefinição enviadas para seu e-mail.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErro(err.message || 'Erro ao solicitar redefinição.');
      } else {
        setErro('Falha ao processar solicitação.');
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SeedBrandLogo size={24} boxed="solid" />
        </div>

        <div style={{ maxWidth: '520px', margin: 'auto 0' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.03em', marginBottom: '16px' }}>
            Recuperação Segura de Acesso
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: 1.6, marginBottom: '28px' }}>
            Informe o e-mail cadastrado em sua fazenda ou tenant corporativo. Enviaremos um link assinado criptograficamente para você redefinir sua senha com segurança.
          </p>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Seed Agro Platform • Segurança & Governança Agrícola
        </div>
      </div>

      {/* Lado Direito: Formulário */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>
              Esqueceu sua senha?
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Digite seu e-mail institucional para receber as instruções de recuperação.
            </p>
          </div>

          {erro && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--danger)',
                color: '#f87171',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12.5px',
                marginBottom: '16px',
              }}
            >
              {erro}
            </div>
          )}

          {mensagemSucesso && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--accent-text)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                lineHeight: 1.5,
                marginBottom: '20px',
              }}
            >
              {mensagemSucesso}
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '42px',
                marginTop: '6px',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {loading ? 'Enviando Instruções...' : 'Enviar Link de Redefinição'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link
              to="/login"
              style={{
                color: 'var(--text-muted)',
                fontSize: '13px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ← Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
