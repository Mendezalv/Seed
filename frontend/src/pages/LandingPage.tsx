import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCotacoes } from '../context/CotacoesContext';
import { SeedBrandLogo } from '../components/common/SeedBrandLogo';

// ─── ICONOGRAFIA VETORIAL MONOCROMÁTICA (PADRÃO LINEAR / LUCIDE) ─────────────
const Icons = {
  Dashboard: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  ),
  GisMap: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  ),
  Telemetry: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ),
  Surveillance: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Finance: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  Lock: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Copy: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  ),
  Check: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Zoom: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
      <line x1="11" x2="11" y1="8" y2="14" />
      <line x1="8" x2="14" y1="11" y2="11" />
    </svg>
  ),
  ArrowUpRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="7" x2="17" y1="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  ),
  SpreadsheetBroken: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <line x1="8" x2="16" y1="13" y2="13" />
      <line x1="8" x2="16" y1="17" y2="17" />
      <line x1="10" x2="10" y1="13" y2="17" />
    </svg>
  ),
  ClockAlert: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  AlertTriangle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  ),
  TrendingDown: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  ),
  Wrench: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  AuditFile: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Database: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  Shield: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  FileCheck: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  ),
  Play: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginDemo } = useAuth();
  const { cotacoes } = useCotacoes();

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Teclado: ESC fecha lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTestDrive = () => {
    loginDemo();
    navigate('/');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#09090b',
        color: '#f4f4f5',
        fontFamily: 'var(--font-sans, Inter, sans-serif)',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* ─── AMBIENT SPECULAR LIGHTING (EMIL KOWALSKI CRAFT) ─────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '1280px',
          height: '620px',
          background: 'radial-gradient(ellipse 65% 50% at 50% 0%, rgba(16, 185, 129, 0.14) 0%, rgba(16, 185, 129, 0) 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ─── 1. NAVBAR DE ALTA PRECISÃO (GLASSMORPHISM) ────────────────── */}
      <header
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          background: 'rgba(9, 9, 11, 0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Identity com o Logotipo Oficial GIS Radar Seed (Símbolo da Gota) */}
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <SeedBrandLogo size={24} showBadge={true} boxed="solid" />
          </div>

          {/* Desktop Nav Links com Hover Suave */}
          <nav style={{ display: 'none', alignItems: 'center', gap: '30px' }} className="landing-desktop-nav">
            <button
              onClick={() => scrollToSection('dores')}
              style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', transition: 'color 150ms ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
            >
              Gargalos do Campo
            </button>
            <button
              onClick={() => scrollToSection('diferenciais')}
              style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', transition: 'color 150ms ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
            >
              O Que Muda
            </button>
            <button
              onClick={() => scrollToSection('offline')}
              style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', transition: 'color 150ms ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
            >
              Modo Offline (PWA)
            </button>
            <button
              onClick={() => scrollToSection('seguranca')}
              style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', transition: 'color 150ms ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
            >
              Governança & LCDPR
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleTestDrive}
              className="kowalski-btn"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e4e4e7',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              Fazenda Modelo
            </button>

            <button
              onClick={() => navigate('/login')}
              className="kowalski-btn"
              style={{
                background: 'var(--accent, #10b981)',
                color: '#09090b',
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 2px 10px rgba(16, 185, 129, 0.3)',
              }}
            >
              Acessar
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.4" stroke="currentColor" style={{ width: '13px', height: '13px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ─── 2. HERO SECTION COM PROPOSTA DE VALOR & SCREENSHOTS ───────── */}
      <section style={{ position: 'relative', padding: '64px 24px 40px', maxWidth: '1240px', margin: '0 auto', textAlign: 'center', zIndex: 1 }}>
        
        {/* Pill Tag Superior com Pulso Emil Kowalski */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: 'var(--accent-text, #34d399)',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '24px',
            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.1)',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--accent, #10b981)',
              boxShadow: '0 0 8px #10b981',
              animation: 'pulse-dot 2s infinite ease-in-out',
            }}
          />
          Seed Agro Intelligence • Plataforma de Gestão Produtiva & Financeira
        </div>

        {/* Headline Principal Editorial */}
        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 58px)',
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.038em',
            maxWidth: '940px',
            margin: '0 auto 20px',
            background: 'linear-gradient(180deg, #ffffff 30%, #a1a1aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Chega de gerenciar safras de milhões de reais em planilhas soltas
        </h1>

        {/* Subtítulo Narrativo */}
        <p
          style={{
            fontSize: 'clamp(15px, 1.8vw, 17.5px)',
            color: '#a1a1aa',
            lineHeight: 1.6,
            maxWidth: '780px',
            margin: '0 auto 34px',
          }}
        >
          Do mapeamento de talhões com Sentinel-2 ao breakeven por saca e telemetria de máquinas em campo.
          O Seed centraliza o ciclo completo da fazenda com governança, histórico auditável e funcionamento 100% offline.
        </p>

        {/* Botões de Ação do Hero (Estilo Tátil Kowalski) */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '36px' }}>
          <button
            onClick={() => navigate('/login')}
            className="kowalski-btn"
            style={{
              background: 'var(--accent, #10b981)',
              color: '#09090b',
              padding: '13px 28px',
              borderRadius: '10px',
              fontSize: '14.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 20px rgba(16, 185, 129, 0.35)',
            }}
          >
            Comece Gratuitamente
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.4" stroke="currentColor" style={{ width: '15px', height: '15px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>

          <button
            onClick={handleTestDrive}
            className="kowalski-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#f4f4f5',
              padding: '13px 26px',
              borderRadius: '10px',
              fontSize: '14.5px',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
            }}
          >
            <Icons.Play style={{ color: '#10b981' }} />
            Ver Demonstração ao Vivo
          </button>
        </div>

        {/* Ticker Oficial de Cotações com Efeito Glassmorphic */}
        <div
          style={{
            padding: '10px 22px',
            background: 'rgba(18, 19, 23, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '20px',
            fontSize: '12.5px',
            fontFamily: 'var(--font-mono, monospace)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            backdropFilter: 'blur(12px)',
            marginBottom: '42px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.25)',
          }}
        >
          {cotacoes.slice(0, 4).map((item, index) => (
            <React.Fragment key={item.codigo}>
              {index > 0 && <span style={{ color: '#27272a' }}>•</span>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#71717a' }}>{item.nome.toUpperCase()}:</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>
                  {item.codigo === 'DOLAR' ? `R$ ${item.preco.toFixed(2)}` : `R$ ${item.preco.toFixed(2)}`}
                </span>
                <span
                  style={{
                    color: item.variacao_pct >= 0 ? '#10b981' : '#ef4444',
                    fontWeight: 600,
                    fontSize: '11.5px',
                  }}
                >
                  {item.variacao_pct >= 0 ? `+${item.variacao_pct}%` : `${item.variacao_pct}%`}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* ─── SHOWCASE INTEGRADO EM 2 COLUNAS (DISPOSITIVOS LIMPOS) ───────── */}
        <style>{`
          .devices-showcase-grid {
            display: grid;
            grid-template-columns: minmax(320px, 1fr) minmax(360px, 1.25fr);
            gap: 48px;
            align-items: center;
            text-align: left;
            margin-top: 42px;
            width: 100%;
          }
          .devices-showcase-visual {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 30px 10px 40px 40px;
          }
          .devices-desktop-mockup {
            width: 100%;
            max-width: 580px;
            border-radius: 12px;
            background: #0d0e12;
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.9), 0 0 40px rgba(16, 185, 129, 0.06);
            overflow: hidden;
            position: relative;
          }
          .devices-phone-mockup {
            position: absolute;
            left: 0;
            bottom: 0;
            width: clamp(190px, 20vw, 230px);
            background: #09090b;
            border-radius: 38px;
            border: 4px solid #27272a;
            padding: 8px 8px 10px;
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.95), 0 10px 30px rgba(0, 0, 0, 0.85);
            z-index: 3;
            overflow: hidden;
          }
          @media (max-width: 960px) {
            .devices-showcase-grid {
              grid-template-columns: 1fr;
              gap: 40px;
              margin-top: 32px;
            }
            .devices-showcase-visual {
              justify-content: center;
              padding: 20px 0 30px 20px;
            }
            .devices-phone-mockup {
              left: 5%;
              bottom: -10px;
              width: 190px;
            }
          }
          @media (max-width: 520px) {
            .devices-showcase-visual {
              padding: 10px 0 20px 10px;
            }
            .devices-phone-mockup {
              left: 0;
              bottom: -8px;
              width: 150px;
              border-width: 3px;
              border-radius: 28px;
              padding: 6px 6px 8px;
            }
          }
        `}</style>

        <div className="devices-showcase-grid">
          {/* Coluna Esquerda: Texto Direto e Benefícios */}
          <div style={{ maxWidth: '520px' }}>
            <h2
              style={{
                fontSize: 'clamp(30px, 4vw, 48px)',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: 1.15,
                color: '#ffffff',
                marginBottom: '20px',
              }}
            >
              Atualize no celular.<br />
              Analise no computador.
            </h2>

            <p
              style={{
                color: '#a1a1aa',
                fontSize: '15.5px',
                lineHeight: 1.65,
                marginBottom: '32px',
              }}
            >
              O assessor ou agrônomo em campo registra a informação pelo celular, mesmo sem internet. A sede acompanha no painel web em tempo real. Sem retrabalho, sem cadernos de campo e sem mensagens no WhatsApp pedindo atualização.
            </p>

            {/* Checklist de Benefícios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: '1.5px solid #10b981',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#10b981',
                    flexShrink: 0,
                  }}
                >
                  <Icons.Check style={{ width: '12px', height: '12px' }} />
                </div>
                <span style={{ fontSize: '15px', color: '#e4e4e7', fontWeight: 500 }}>
                  Funciona em qualquer navegador e celular
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: '1.5px solid #10b981',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#10b981',
                    flexShrink: 0,
                  }}
                >
                  <Icons.Check style={{ width: '12px', height: '12px' }} />
                </div>
                <span style={{ fontSize: '15px', color: '#e4e4e7', fontWeight: 500 }}>
                  Dados sincronizados entre todos os membros
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: '1.5px solid #10b981',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#10b981',
                    flexShrink: 0,
                  }}
                >
                  <Icons.Check style={{ width: '12px', height: '12px' }} />
                </div>
                <span style={{ fontSize: '15px', color: '#e4e4e7', fontWeight: 500 }}>
                  Sem instalação — acesse direto pelo link
                </span>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Dispositivos Sobrepostos (Computador ao Fundo + Celular na Frente) */}
          <div className="devices-showcase-visual">
            {/* Mockup do Computador (Janela Web ao Fundo) */}
            <div className="devices-desktop-mockup">
              {/* Barra do Navegador */}
              <div
                style={{
                  height: '32px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56', opacity: 0.8 }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e', opacity: 0.8 }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f', opacity: 0.8 }} />
                </div>
                <div
                  style={{
                    margin: '0 auto',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '5px',
                    padding: '2px 14px',
                    fontSize: '10.5px',
                    color: '#71717a',
                    fontFamily: 'monospace',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Icons.Lock style={{ width: '9px', height: '9px', color: '#10b981' }} />
                  <span>seedagro.com.br/dashboard</span>
                </div>
              </div>

              {/* Tela do Painel */}
              <img
                src="/screenshots/dashboard.png"
                alt="Painel Seed no computador"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>

            {/* Mockup do Celular (Smartphone em Destaque na Frente) */}
            <div className="devices-phone-mockup">
              {/* Notch / Dynamic Island */}
              <div
                style={{
                  width: '64px',
                  height: '14px',
                  background: '#000000',
                  borderRadius: '10px',
                  margin: '1px auto 6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              />

              {/* Tela do Aplicativo Mobile */}
              <div
                style={{
                  borderRadius: '26px',
                  overflow: 'hidden',
                  background: '#000',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <img
                  src="/screenshots/mobile-campo.png"
                  alt="Aplicativo Seed Mobile no celular"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. SEÇÃO: BENTO GRID DE DORES DO PRODUTOR RURAL ───────────── */}
      <section id="dores" style={{ padding: '84px 24px', maxWidth: '1240px', margin: '0 auto', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Desafios Operacionais & Financeiros
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 3.8vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '14px', color: '#fff' }}>
            Você reconhece algum desses gargalos na sua fazenda?
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '15.5px', maxWidth: '640px', margin: '0 auto' }}>
            Se a resposta for sim para pelo menos um, o Seed foi construído sob medida para a sua escala de operação.
          </p>
        </div>

        {/* Bento Grid Editorial com 6 Dores Críticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Card 1 */}
          <div className="taste-card" style={{ padding: '30px 26px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'grid', placeItems: 'center', color: '#ef4444' }}>
                <Icons.SpreadsheetBroken />
              </div>
              <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '3px 8px', borderRadius: '5px', fontWeight: 600 }}>
                Gargalo Operacional
              </span>
            </div>
            <h3 style={{ fontSize: '17.5px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Planilhas com dezenas de abas quebradas</h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              Fórmulas corrompidas, arquivos duplicados com nomes como <em>"safra_final_v3.xlsx"</em> e ninguém sabe qual versão contém o saldo real de insumos no armazém.
            </p>
          </div>

          {/* Card 2 */}
          <div className="taste-card" style={{ padding: '30px 26px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'grid', placeItems: 'center', color: '#ef4444' }}>
                <Icons.ClockAlert />
              </div>
              <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '3px 8px', borderRadius: '5px', fontWeight: 600 }}>
                Gargalo Financeiro
              </span>
            </div>
            <h3 style={{ fontSize: '17.5px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Fechamento de safra lento e impreciso</h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              A safra termina em março, mas o balanço de rentabilidade líquida só fica pronto em maio. Decisões de compra da safrinha são tomadas no escuro.
            </p>
          </div>

          {/* Card 3 */}
          <div className="taste-card" style={{ padding: '30px 26px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'grid', placeItems: 'center', color: '#ef4444' }}>
                <Icons.AlertTriangle />
              </div>
              <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '3px 8px', borderRadius: '5px', fontWeight: 600 }}>
                Risco Fitossanitário
              </span>
            </div>
            <h3 style={{ fontSize: '17.5px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Surpresas com pragas e perdas na lavoura</h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              A ferrugem asiática ou percevejo marrom é detectado quando o dano econômico já está instalado. A pulverização reativa custa 3x mais caro e derruba a produtividade.
            </p>
          </div>

          {/* Card 4 */}
          <div className="taste-card" style={{ padding: '30px 26px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'grid', placeItems: 'center', color: '#ef4444' }}>
                <Icons.TrendingDown />
              </div>
              <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '3px 8px', borderRadius: '5px', fontWeight: 600 }}>
                Risco de Mercado
              </span>
            </div>
            <h3 style={{ fontSize: '17.5px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Zero visibilidade de breakeven por saca</h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              O produtor pergunta: <em>"qual é o nosso custo por saca hoje para travar o hedge na B3?"</em> e ninguém tem os números consolidados de imediato.
            </p>
          </div>

          {/* Card 5 */}
          <div className="taste-card" style={{ padding: '30px 26px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'grid', placeItems: 'center', color: '#ef4444' }}>
                <Icons.Wrench />
              </div>
              <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '3px 8px', borderRadius: '5px', fontWeight: 600 }}>
                Gargalo de Equipe
              </span>
            </div>
            <h3 style={{ fontSize: '17.5px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Equipe e máquinas desalinhadas no WhatsApp</h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              Ordens de serviço perdem-se em conversas soltas. O operador aplica a dosagem desatualizada ou pula a revisão crítica de 500h do trator principal.
            </p>
          </div>

          {/* Card 6 */}
          <div className="taste-card" style={{ padding: '30px 26px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'grid', placeItems: 'center', color: '#ef4444' }}>
                <Icons.AuditFile />
              </div>
              <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '3px 8px', borderRadius: '5px', fontWeight: 600 }}>
                Risco Tributário & Bancário
              </span>
            </div>
            <h3 style={{ fontSize: '17.5px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Sem rastreabilidade para auditoria e LCDPR</h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              Sem log de quem comprou, aplicou ou colheu em cada talhão, a prestação de contas do Livro Caixa Digital da Receita Federal e os laudos para bancos viram um tormento.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 4. SEÇÃO: "O QUE MUDA COM O SEED" (TRANSFORMAÇÃO NUMÉRICA) ─── */}
      <section id="diferenciais" style={{ padding: '84px 24px', maxWidth: '1240px', margin: '0 auto', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Transformação Operacional
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 3.8vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '14px', color: '#fff' }}>
            O que muda na prática com o Seed
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '15.5px', maxWidth: '680px', margin: '0 auto' }}>
            Arquitetura desenhada para quem lida com os desafios reais do agronegócio moderno. Menos cliques, zero papel, decisões embasadas em dados científicos.
          </p>
        </div>

        {/* 3 Blocos de Transformação Numérica Editorial */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Card 01 */}
          <div
            className="taste-card landing-transform-card"
            style={{
              padding: '36px',
              borderRadius: '18px',
              display: 'grid',
              gridTemplateColumns: '70px 1.1fr 1fr',
              gap: '28px',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '38px', fontWeight: 900, color: '#3f3f46', fontFamily: 'var(--font-mono, monospace)' }}>
              01
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
                Cada talhão e operação em um único painel georreferenciado
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                Mapeamento vetorial SIRGAS 2000, histórico de safras, vigor vegetativo Sentinel-2 NDVI e dosagens de insumos acessíveis em segundos para qualquer talhão da fazenda.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderLeft: '3px solid #ef4444', borderRadius: '4px', fontSize: '13px', color: '#fca5a5' }}>
                <strong>Antes:</strong> 20 minutos procurando em planilhas dispersas, mapas desenhados à mão e pastas físicas.
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.08)', borderLeft: '3px solid #10b981', borderRadius: '4px', fontSize: '13px', color: '#6ee7b7' }}>
                <strong>Agora:</strong> 3 cliques e todo o mapa GIS com histórico e vigor Sentinel-2 consolidado na tela.
              </div>
              <button
                onClick={() => setPreviewImage('/screenshots/talhoes-gis.png')}
                className="kowalski-btn"
                style={{
                  alignSelf: 'flex-start',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e4e4e7',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '2px',
                }}
              >
                <Icons.GisMap style={{ color: '#10b981' }} />
                <span>Ver interface real do Talhões & GIS</span>
                <Icons.ArrowUpRight style={{ color: '#10b981' }} />
              </button>
            </div>
          </div>

          {/* Card 02 */}
          <div
            className="taste-card landing-transform-card"
            style={{
              padding: '36px',
              borderRadius: '18px',
              display: 'grid',
              gridTemplateColumns: '70px 1.1fr 1fr',
              gap: '28px',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '38px', fontWeight: 900, color: '#3f3f46', fontFamily: 'var(--font-mono, monospace)' }}>
              02
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
                Viabilidade econômica e DRE por hectare apurado em tempo real
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                Ponto de equilíbrio dinâmico (breakeven em sc/ha), gestão de travas de hedge físico/futuro e apuração automática do Livro Caixa Digital do Produtor Rural (LCDPR).
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderLeft: '3px solid #ef4444', borderRadius: '4px', fontSize: '13px', color: '#fca5a5' }}>
                <strong>Antes:</strong> Descobrir o lucro ou prejuízo da safra meses após o término da colheita.
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.08)', borderLeft: '3px solid #10b981', borderRadius: '4px', fontSize: '13px', color: '#6ee7b7' }}>
                <strong>Agora:</strong> Margem líquida e custo/ha calculados automaticamente com cada nota fiscal lançada.
              </div>
              <button
                onClick={() => setPreviewImage('/screenshots/viabilidade.png')}
                className="kowalski-btn"
                style={{
                  alignSelf: 'flex-start',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e4e4e7',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '2px',
                }}
              >
                <Icons.Finance style={{ color: '#10b981' }} />
                <span>Ver interface real de Viabilidade & Breakeven</span>
                <Icons.ArrowUpRight style={{ color: '#10b981' }} />
              </button>
            </div>
          </div>

          {/* Card 03 */}
          <div
            className="taste-card landing-transform-card"
            style={{
              padding: '36px',
              borderRadius: '18px',
              display: 'grid',
              gridTemplateColumns: '70px 1.1fr 1fr',
              gap: '28px',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '38px', fontWeight: 900, color: '#3f3f46', fontFamily: 'var(--font-mono, monospace)' }}>
              03
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
                Vigilância sanitária preditiva & IA Fitopatológica (Spore-Cast)
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                Modelo matemático que correlaciona molhamento foliar e temperatura para antecipar esporulação fúngica, com diagnóstico fotográfico por IA e ordem de aplicação direta.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderLeft: '3px solid #ef4444', borderRadius: '4px', fontSize: '13px', color: '#fca5a5' }}>
                <strong>Antes:</strong> Pulverizar no escuro por calendário fixo ou agir tarde após ver as folhas amareladas.
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.08)', borderLeft: '3px solid #10b981', borderRadius: '4px', fontSize: '13px', color: '#6ee7b7' }}>
                <strong>Agora:</strong> Alertas preditivos com recomendação agronômica exata de calda e dosagem por ha.
              </div>
              <button
                onClick={() => setPreviewImage('/screenshots/vigilancia.png')}
                className="kowalski-btn"
                style={{
                  alignSelf: 'flex-start',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e4e4e7',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '2px',
                }}
              >
                <Icons.Surveillance style={{ color: '#10b981' }} />
                <span>Ver interface real de Vigilância com IA</span>
                <Icons.ArrowUpRight style={{ color: '#10b981' }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. SEÇÃO: ARQUITETURA PWA OFFLINE-FIRST ─── */}
      <section id="offline" style={{ padding: '84px 24px', maxWidth: '1240px', margin: '0 auto', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '48px', alignItems: 'center' }} className="landing-mobile-split">
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#34d399',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '18px',
              }}
            >
              <Icons.Database style={{ color: '#34d399' }} />
              Arquitetura PWA Offline-First
            </div>

            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '20px', color: '#fff' }}>
              Tecnologia Offline-First:<br />tolerância total à falta de sinal
            </h2>

            <p style={{ color: '#a1a1aa', fontSize: '15px', lineHeight: 1.65, marginBottom: '32px' }}>
              O tratorista e o consultor técnico realizam apontamentos e laudos fotográficos diretamente no talhão, mesmo em grotas e pivôs com zero sinal 4G.
              Assim que o dispositivo volta ao alcance da sede ou do Wi-Fi, o Seed sincroniza tudo silenciosamente em segundo plano.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'grid', placeItems: 'center', color: '#10b981', flexShrink: 0, marginTop: '2px' }}>
                  ✓
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>Banco local SQLite & IndexedDB</h4>
                  <p style={{ color: '#a1a1aa', fontSize: '13.5px', margin: 0 }}>Apontamentos, histórico de cultivares e medições salvos diretamente no aparelho com tolerância total a quedas de energia e sinal.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'grid', placeItems: 'center', color: '#10b981', flexShrink: 0, marginTop: '2px' }}>
                  ✓
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>Resolução de Conflitos Last-Write-Wins (LWW)</h4>
                  <p style={{ color: '#a1a1aa', fontSize: '13.5px', margin: 0 }}>Garante que apontamentos concorrentes da equipe não sobrescrevam lançamentos fiscais ou ordens de serviço pendentes.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'grid', placeItems: 'center', color: '#10b981', flexShrink: 0, marginTop: '2px' }}>
                  ✓
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>Instalação PWA Instantânea</h4>
                  <p style={{ color: '#a1a1aa', fontSize: '13.5px', margin: 0 }}>Sem downloads pesados de lojas de apps: instale com 1 clique direto pelo Chrome ou Safari em qualquer celular ou tablet.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Smartphone Mockup de Alta Fidelidade com Screenshot Real */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              className="kowalski-btn"
              style={{
                width: '320px',
                height: '630px',
                background: '#0d0e12',
                borderRadius: '44px',
                border: '5px solid #27272a',
                padding: '12px 10px',
                boxShadow: '0 26px 70px rgba(0,0,0,0.9), 0 0 45px rgba(16, 185, 129, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={() => setPreviewImage('/screenshots/mobile-campo.png')}
            >
              {/* Dynamic Island / Notch */}
              <div
                style={{
                  width: '94px',
                  height: '18px',
                  background: '#18181b',
                  borderRadius: '12px',
                  margin: '0 auto 10px',
                  zIndex: 2,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 4px #10b981' }} />
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#27272a' }} />
              </div>

              {/* Screenshot Real do App Mobile */}
              <div
                style={{
                  flex: 1,
                  borderRadius: '26px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: '#09090b',
                }}
              >
                <img
                  src="/screenshots/mobile-campo.png"
                  alt="Interface real do Seed Mobile em campo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    display: 'block',
                  }}
                />

                {/* Badge Flutuante de Modo Offline */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    right: '12px',
                    padding: '8px 12px',
                    background: 'rgba(9, 9, 11, 0.92)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#34d399',
                    textAlign: 'center',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Icons.Database style={{ color: '#34d399' }} />
                  <span>PWA 100% Offline • SQLite / IndexedDB Ativo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. SEÇÃO: "GOVERNANÇA & SEGURANÇA CORPORATIVA" ───────────── */}
      <section id="seguranca" style={{ padding: '84px 24px', maxWidth: '1240px', margin: '0 auto', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Governança, Bancos & Fisco
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 3.8vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '14px', color: '#fff' }}>
            Dados estratégicos protegidos com padrão corporativo
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '15.5px', maxWidth: '640px', margin: '0 auto' }}>
            Fazendas profissionais movimentam milhões e demandam rigor contábil. O Seed foi projetado com isolamento multitenant e conformidade tributária desde o primeiro dia.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
          {/* Card Governança 1: RBAC */}
          <div className="taste-card" style={{ padding: '34px', borderRadius: '18px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'grid', placeItems: 'center', color: '#10b981', marginBottom: '18px' }}>
              <Icons.Shield />
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Permissões Granulares por Perfil (RBAC)</h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, marginBottom: '18px' }}>
              Defina com precisão quem é Administrador Geral, Gestor Agronômico, Operador de Máquinas ou Consultor Externo. Cada colaborador acessa estritamente o necessário para sua rotina.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', color: '#d4d4d8' }}>• ADMIN (Diretoria)</span>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', color: '#d4d4d8' }}>• GESTOR (Agrônomos)</span>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', color: '#d4d4d8' }}>• OPERADOR (Campo)</span>
            </div>
          </div>

          {/* Card Governança 2: Rastreabilidade Fiscal & ESG */}
          <div className="taste-card" style={{ padding: '34px', borderRadius: '18px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', display: 'grid', placeItems: 'center', color: '#38bdf8', marginBottom: '18px' }}>
              <Icons.FileCheck />
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Rastreabilidade Total & Livro Caixa (LCDPR)</h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, marginBottom: '18px' }}>
              Cada insumo movimentado e cada saca colhida possui registro imutável com data, lote e responsável. Exportação automática oficial para o LCDPR da Receita Federal e laudos do Plano ABC+.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', color: '#d4d4d8' }}>• Importação XML NFe</span>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', color: '#d4d4d8' }}>• DRE Gerencial PDF/Excel</span>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', color: '#d4d4d8' }}>• Crédito Rural Verde</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. FINAL HIGH-CONVERSION CTA BANNER (EMIL KOWALSKI CRAFT) ──── */}
      <section style={{ padding: '80px 24px', maxWidth: '1240px', margin: '0 auto' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(9, 9, 11, 0.95) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '24px',
            padding: '60px 32px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 50px rgba(16, 185, 129, 0.12)',
          }}
        >
          {/* Subtle Ambient Radial Light */}
          <div
            style={{
              position: 'absolute',
              top: '0%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '500px',
              height: '240px',
              background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, letterSpacing: '-0.035em', marginBottom: '16px', color: '#fff', position: 'relative' }}>
            Transforme a gestão da sua safra agora mesmo
          </h2>

          <p style={{ color: '#a1a1aa', fontSize: '16px', maxWidth: '640px', margin: '0 auto 36px', lineHeight: 1.6, position: 'relative' }}>
            Junte-se a produtores e consultorias agrícolas que eliminaram planilhas manuais e elevaram sua margem líquida por hectare.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', flexWrap: 'wrap', position: 'relative' }}>
            <button
              onClick={() => navigate('/login')}
              className="kowalski-btn"
              style={{
                background: 'var(--accent, #10b981)',
                color: '#09090b',
                padding: '14px 32px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 4px 24px rgba(16, 185, 129, 0.4)',
              }}
            >
              Comece Gratuitamente
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.4" stroke="currentColor" style={{ width: '15px', height: '15px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>

            <button
              onClick={handleTestDrive}
              className="kowalski-btn"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                padding: '14px 28px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.16)',
                cursor: 'pointer',
              }}
            >
              Explorar Fazenda Modelo
            </button>

            <a
              href="https://wa.me/5565999999999?text=Ol%C3%A1%2C%20gostaria%20de%20conhecer%20a%20plataforma%20Seed%20para%20minha%20fazenda."
              target="_blank"
              rel="noopener noreferrer"
              className="kowalski-btn"
              style={{
                background: 'transparent',
                color: '#a1a1aa',
                padding: '14px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
              }}
            >
              Falar com Especialista Agronômico ↗
            </a>
          </div>

          <div style={{ marginTop: '26px', fontSize: '12.5px', color: '#71717a', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span>✓ Sem necessidade de cartão de crédito</span>
            <span>•</span>
            <span>✓ Demonstração com dados reais</span>
            <span>•</span>
            <span>✓ Atendimento especializado no agro</span>
          </div>
        </div>
      </section>

      {/* ─── 8. RODAPÉ INSTITUCIONAL MINIMALISTA ────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '36px 24px',
          color: '#71717a',
          fontSize: '13px',
          background: '#070709',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>Seed</span>
            <span>•</span>
            <span>© 2026 Seed Agro Intelligence. Todos os direitos reservados.</span>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <span style={{ cursor: 'pointer', color: '#a1a1aa' }} onClick={() => navigate('/login')}>
              Área do Produtor
            </span>
            <span style={{ cursor: 'pointer', color: '#a1a1aa' }} onClick={() => navigate('/recuperar-senha')}>
              Recuperar Senha
            </span>
            <span style={{ cursor: 'pointer', color: '#a1a1aa' }} onClick={() => scrollToSection('seguranca')}>
              Políticas de Dados & LCDPR
            </span>
          </div>
        </div>
      </footer>

      {/* ─── 9. MODAL LIGHTBOX PARA SCREENSHOTS EM TELA CHEIA ───────────── */}
      {previewImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'spring-in 180ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '1380px',
              width: '100%',
              maxHeight: '94vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#e4e4e7', fontFamily: 'var(--font-mono, monospace)' }}>
                  Interface Oficial do Seed OS • Captura de Tela Real
                </span>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="kowalski-btn"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Imagem Ampliada */}
            <img
              src={previewImage}
              alt="Screenshot em Alta Resolução do Seed OS"
              style={{
                width: '100%',
                maxHeight: '84vh',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 24px 70px rgba(0, 0, 0, 0.95), 0 0 40px rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            />

            <div style={{ marginTop: '12px', color: '#a1a1aa', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Pressione</span>
              <kbd style={{ background: '#27272a', border: '1px solid #3f3f46', padding: '2px 6px', borderRadius: '4px', color: '#fff', fontFamily: 'monospace' }}>ESC</kbd>
              <span>ou clique fora da imagem para fechar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
