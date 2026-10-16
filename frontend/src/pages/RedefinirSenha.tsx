import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export const RedefinirSenha: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setMensagemSucesso(null);

    if (!token) {
      setErro('Token de redefinição não encontrado na URL. Solicite um novo link.');
      return;
    }

    if (novaSenha.length < 8) {
      setErro('A nova senha deve possuir no mínimo 8 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('A confirmação de senha não coincide com a nova senha digitada.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post<{ mensagem: string; sucesso: boolean }>('/auth/redefinir-senha', {
        token,
        nova_senha: novaSenha,
      });
      setMensagemSucesso(res.mensagem || 'Senha redefinida com sucesso!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErro(err.message || 'Erro ao redefinir senha.');
      } else {
        setErro('Falha ao processar redefinição.');
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
            <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.02em' }}>Seed</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Agro Intelligence
            </span>
          </div>
        </div>

        <div style={{ maxWidth: '520px', margin: 'auto 0' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.03em', marginBottom: '16px' }}>
            Redefinição de Senha
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: 1.6, marginBottom: '28px' }}>
            Crie uma nova senha de acesso forte e segura para a sua conta corporativa no Seed Agro.
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
              Criar Nova Senha
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Digite e confirme a sua nova senha de acesso (mínimo 8 caracteres).
            </p>
          </div>

          {!token && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--danger)',
                color: '#f87171',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              Token não identificado. Verifique se clicou no link completo enviado por e-mail ou{' '}
              <Link to="/recuperar-senha" style={{ color: '#fca5a5', fontWeight: 600 }}>solicite um novo link</Link>.
            </div>
          )}

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
              {mensagemSucesso} Redirecionando para o login...
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
                Nova Senha
              </label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
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
              <label
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a nova senha"
                required
                minLength={8}
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
              disabled={loading || !token}
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
              {loading ? 'Salvando Nova Senha...' : 'Salvar Nova Senha'}
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
              ← Ir para o Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
