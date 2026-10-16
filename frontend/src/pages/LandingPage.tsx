import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginDemo } = useAuth();

  const handleTestDrive = () => {
    loginDemo();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#09090b', color: '#f4f4f5', fontFamily: 'var(--font-sans)' }}>
      {/* Navbar Superior */}
      <header
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(9, 9, 11, 0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div
              style={{
                width: '36px',
                height: '36px',
                background: 'var(--accent, #10b981)',
                borderRadius: '9px',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <svg viewBox="0 0 256 256" width="22" height="22" fill="#09090B" role="img" aria-label="Seed Logo">
                <path d="M 120 28 A 100 100 0 0 0 28 120 L 60 120 A 68 68 0 0 1 120 60 Z" />
                <path d="M 136 60 A 68 68 0 0 1 196 120 L 228 120 A 100 100 0 0 0 136 28 Z" />
                <path d="M 60 136 L 28 136 A 100 100 0 0 0 120 228 L 120 196 A 68 68 0 0 1 60 136 Z" />
                <path d="M 196 136 A 68 68 0 0 1 136 196 L 136 228 A 100 100 0 0 0 228 136 Z" />
                <path d="M 128 72 C 142 98 154 118 154 132 C 154 146 142 158 128 158 C 114 158 102 146 102 132 C 102 118 114 98 128 72 Z" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>Seed</span>
              <span style={{ fontSize: '10px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Agro Intelligence
              </span>
            </div>
          </div>

          {/* Links e Ações */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={handleTestDrive}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e4e4e7',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
            >
              Fazenda Modelo
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'var(--accent, #10b981)',
                border: 'none',
                color: '#09090b',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Entrar
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '80px 24px 60px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: 'var(--accent, #10b981)',
            fontSize: '12.5px',
            fontWeight: 600,
            marginBottom: '24px',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
          Plataforma de Gestão Rural & Inteligência Agrícola v1.0
        </div>

        <h1
          style={{
            fontSize: 'clamp(36px, 5.5vw, 64px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.035em',
            maxWidth: '920px',
            margin: '0 auto 24px',
            background: 'linear-gradient(180deg, #ffffff 40%, #a1a1aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          O Sistema Operacional Inteligente para o Produtor Rural de Alta Produtividade
        </h1>

        <p
          style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: '#a1a1aa',
            lineHeight: 1.6,
            maxWidth: '780px',
            margin: '0 auto 40px',
          }}
        >
          Unifique mapeamento de talhões com GIS, vigilância epidemiológica Spore-Cast, modelagem de viabilidade econômica com travas de hedge e créditos de carbono do Plano ABC+ em uma experiência fluida e moderna.
        </p>

        {/* Botões Principais */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'var(--accent, #10b981)',
              color: '#09090b',
              padding: '14px 28px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
            }}
          >
            Acessar Plataforma
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>

          <button
            onClick={handleTestDrive}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#e4e4e7',
              padding: '14px 28px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
            }}
          >
            Conhecer Fazenda Modelo
          </button>
        </div>

        {/* Ticker Dinâmico de Mercado */}
        <div
          style={{
            marginTop: '56px',
            padding: '12px 20px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '24px',
            fontSize: '13px',
            fontFamily: 'var(--font-mono, monospace)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div>
            <span style={{ color: '#71717a' }}>SOJA PNG: </span>
            <span style={{ fontWeight: 600, color: '#fff' }}>R$ 138,40/sc</span>
            <span style={{ color: '#10b981', marginLeft: '6px' }}>+0.8%</span>
          </div>
          <span style={{ color: '#3f3f46' }}>•</span>
          <div>
            <span style={{ color: '#71717a' }}>MILHO B3: </span>
            <span style={{ fontWeight: 600, color: '#fff' }}>R$ 59,20/sc</span>
            <span style={{ color: '#f87171', marginLeft: '6px' }}>-0.3%</span>
          </div>
          <span style={{ color: '#3f3f46' }}>•</span>
          <div>
            <span style={{ color: '#71717a' }}>BOI GORDO: </span>
            <span style={{ fontWeight: 600, color: '#fff' }}>R$ 242,50/@</span>
            <span style={{ color: '#10b981', marginLeft: '6px' }}>+1.2%</span>
          </div>
          <span style={{ color: '#3f3f46' }}>•</span>
          <div>
            <span style={{ color: '#71717a' }}>DÓLAR PTAX: </span>
            <span style={{ fontWeight: 600, color: '#fff' }}>R$ 5,742</span>
          </div>
        </div>
      </section>

      {/* Grid de Funcionalidades */}
      <section style={{ padding: '60px 24px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Arquitetura Integral para a sua Fazenda
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '15px' }}>
            Cada módulo foi desenvolvido para maximizar sua margem por hectare e assegurar conformidade total.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {/* Card 1 */}
          <div
            style={{
              padding: '28px 24px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'grid', placeItems: 'center', color: '#10b981' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" style={{ width: '22px', height: '22px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.284a2.25 2.25 0 0 0-2.012 0L2.616 5.72A1.125 1.125 0 0 0 2 6.726v12.454c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 600 }}>Talhões & Cartografia GIS</h3>
            <p style={{ color: '#a1a1aa', fontSize: '13.5px', lineHeight: 1.5 }}>
              Delimitação vetorial de polígonos, histórico de safras e cálculo automático de área produtiva com monitoramento via satélite.
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              padding: '28px 24px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', display: 'grid', placeItems: 'center', color: '#f59e0b' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" style={{ width: '22px', height: '22px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 600 }}>Spore-Cast & Fitossanidade</h3>
            <p style={{ color: '#a1a1aa', fontSize: '13.5px', lineHeight: 1.5 }}>
              Modelagem preditiva de ferrugem asiática e pragas combinando telemetria climática INMET/CPTEC e registros de campo.
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={{
              padding: '28px 24px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'grid', placeItems: 'center', color: '#3b82f6' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" style={{ width: '22px', height: '22px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6H2.25m0 0v8.25m0 0a3.75 3.75 0 0 0 3.75 3.75h9.75a3.75 3.75 0 0 0 3.75-3.75V6m0 0h-.75a.75.75 0 0 1-.75-.75V4.5m0 0h-9m9 0v-.75A.75.75 0 0 0 18 3h-.75m0 0H6.75m0 0H6a.75.75 0 0 0-.75.75V4.5" />
              </svg>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 600 }}>DRE & Travas de Hedge</h3>
            <p style={{ color: '#a1a1aa', fontSize: '13.5px', lineHeight: 1.5 }}>
              Cálculo de margem EBITDA, ponto de equilíbrio em sacas/ha e gestão de contratos futuros e Barter com preços em tempo real.
            </p>
          </div>

          {/* Card 4 */}
          <div
            style={{
              padding: '28px 24px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'grid', placeItems: 'center', color: '#10b981' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" style={{ width: '22px', height: '22px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-16.5-.52c-1.01.143-2.01.317-3 .52m0 0a48.667 48.667 0 0 0-1.5 10.536M3 5.49v10.536m0 0a48.667 48.667 0 0 0 1.5 10.536M3 16.026c.99.203 1.99.377 3 .52m0 0A48.416 48.416 0 0 0 12 17c2.291 0 4.545-.16 6.75-.47m0 0c1.01-.143 2.01-.317 3-.52m0 0a48.667 48.667 0 0 0 1.5-10.536M21 5.49v10.536" />
              </svg>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 600 }}>ESG & Créditos ABC+</h3>
            <p style={{ color: '#a1a1aa', fontSize: '13.5px', lineHeight: 1.5 }}>
              Balanço de carbono (tCO2e), auditoria de energia renovável e geração de laudos técnicos para financiamento verde com juros subsidiados.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '36px 24px',
          textAlign: 'center',
          color: '#71717a',
          fontSize: '13px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>© {new Date().getFullYear()} Seed Agro Intelligence • Governança, Tecnologia e Produtividade Rural.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Acesso Restrito</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/recuperar-senha')}>Recuperar Senha</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
