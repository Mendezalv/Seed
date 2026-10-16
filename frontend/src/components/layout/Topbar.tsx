import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSync } from '../../context/SyncContext';
import { useNotifications } from '../../context/NotificationContext';
import { useCotacoes } from '../../context/CotacoesContext';
import { NotificationPopover } from '../common/NotificationPopover';
import { ModalCotacoesMercado } from '../modals/ModalCotacoesMercado';

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
  '/configuracoes': 'Configurações & Equipe',
};

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const currentTitle = ROUTE_NAMES[location.pathname] || 'Visão Geral';
  const { isOnline, isSyncing, pendingCount, lastSyncAt, syncNow } = useSync();
  const { unreadCount, notifications } = useNotifications();
  const { cotacoes } = useCotacoes();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCotacoesModalOpen, setIsCotacoesModalOpen] = useState(false);

  const hasCriticalUnread = notifications.some(
    (n) => !n.lida && (n.severidade === 'CRITICA' || n.severidade === 'ALTA')
  );

  const getSyncLabel = () => {
    if (isSyncing) return 'Sincronizando...';
    if (!isOnline) {
      return pendingCount > 0 ? `Offline (${pendingCount} na fila)` : 'Modo Offline';
    }
    if (pendingCount > 0) return `Sincronizando (${pendingCount})`;
    if (lastSyncAt) return `Sincronizado às ${lastSyncAt}`;
    return 'Sincronizado';
  };

  const getSyncClass = () => {
    if (isSyncing) return 'sync-status syncing';
    if (!isOnline) return 'sync-status offline';
    return 'sync-status';
  };

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
        {/* Cotações CEPEA Dinâmicas em Tempo Real */}
        <div
          className="ticker-bar"
          onClick={() => setIsCotacoesModalOpen(true)}
          title="Clique para abrir painel do pregão em tempo real e simular oscilações"
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          {cotacoes.slice(0, 3).map((item, idx) => {
            const isPositive = item.variacao_pct >= 0;
            return (
              <React.Fragment key={item.codigo}>
                {idx > 0 && <div className="ticker-sep" />}
                <div className="ticker-item">
                  <span>{item.codigo}:</span>
                  <strong>
                    R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                  <span className={isPositive ? 'up' : 'down'}>
                    {isPositive ? '+' : ''}{item.variacao_pct.toFixed(1)}%
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Sync Status Interativo */}
        <button
          className={getSyncClass()}
          onClick={() => syncNow()}
          title="Clique para sincronizar com o servidor central"
        >
          {isSyncing ? (
            <svg
              className="spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              style={{ width: '13px', height: '13px' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          ) : (
            <div className="sync-dot" />
          )}
          <span>{getSyncLabel()}</span>
        </button>

        {/* Botão Notificações com Popover em Tempo Real */}
        <div style={{ position: 'relative' }}>
          <button
            className={`topbar-btn ${hasCriticalUnread ? 'pulse-alert' : ''}`}
            onClick={() => setIsPopoverOpen((prev) => !prev)}
            title="Notificações e Alertas em Tempo Real"
            aria-label="Abrir notificações"
            style={{ position: 'relative' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  minWidth: '17px',
                  height: '17px',
                  padding: '0 4px',
                  borderRadius: '999px',
                  background: hasCriticalUnread ? '#ef4444' : 'var(--accent)',
                  color: hasCriticalUnread ? '#ffffff' : '#052e16',
                  fontSize: '10px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  display: 'grid',
                  placeItems: 'center',
                  border: '2px solid var(--bg-primary)',
                  boxShadow: hasCriticalUnread ? '0 0 8px rgba(239, 68, 68, 0.6)' : 'none',
                  lineHeight: 1,
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationPopover isOpen={isPopoverOpen} onClose={() => setIsPopoverOpen(false)} />
        </div>
      </div>

      <ModalCotacoesMercado
        isOpen={isCotacoesModalOpen}
        onClose={() => setIsCotacoesModalOpen(false)}
      />
    </header>
  );
};
