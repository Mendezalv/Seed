import React from 'react';
import { useLocation } from 'react-router-dom';

interface TopbarProps {
  onToggleSidebar: () => void;
}

const ROUTE_NAMES: Record<string, string> = {
  '/': 'Dashboard',
  '/talhoes': 'Talhões & GIS',
  '/safras': 'Ciclo de Safras',
  '/insumos': 'Insumos & Lotes',
  '/maquinarios': 'Maquinários',
  '/viabilidade': 'Viabilidade Econômica',
  '/vigilancia': 'Vigilância Sanitária',
  '/energia-esg': 'Energia & ESG',
};

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const currentTitle = ROUTE_NAMES[location.pathname] || 'Visão Geral';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-toggle" onClick={onToggleSidebar} title="Menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div className="topbar-breadcrumb">
          <span>Seed</span>
          <span className="sep">/</span>
          <span style={{ color: 'var(--text-primary)' }}>{currentTitle}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Cotações CEPEA */}
        <div className="ticker-bar">
          <div className="ticker-item">
            <span>SOJA:</span>
            <strong>R$ 138,40</strong>
            <span className="up">+0.8%</span>
          </div>
          <div className="ticker-sep" />
          <div className="ticker-item">
            <span>MILHO:</span>
            <strong>R$ 59,20</strong>
            <span className="down">-0.3%</span>
          </div>
          <div className="ticker-sep" />
          <div className="ticker-item">
            <span>BOI:</span>
            <strong>R$ 242,50</strong>
            <span className="up">+1.2%</span>
          </div>
        </div>

        {/* Sync Status */}
        <div className="sync-status">
          <div className="sync-dot" />
          <span>Sincronizado</span>
        </div>

        {/* Botão Notificações */}
        <button className="topbar-btn" title="Notificações">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
        </button>
      </div>
    </header>
  );
};
