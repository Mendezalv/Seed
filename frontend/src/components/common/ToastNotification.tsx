import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import type { NotificationSeverity } from '../../types/notification';

export const ToastNotification: React.FC = () => {
  const { activeToast, dismissToast, markAsRead } = useNotifications();
  const navigate = useNavigate();

  if (!activeToast) return null;

  const getSeverityBadge = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'CRITICA':
        return { label: 'CRÍTICA', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444' };
      case 'ALTA':
        return { label: 'ALTA PRIORIDADE', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b' };
      case 'MEDIA':
        return { label: 'MODERADA', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', border: '#eab308' };
      default:
        return { label: 'INFORMATIVO', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981' };
    }
  };

  const badge = getSeverityBadge(activeToast.severidade);

  const handleAction = () => {
    markAsRead(activeToast.id);
    dismissToast();
    if (activeToast.link_acao) {
      navigate(activeToast.link_acao);
    }
  };

  return (
    <div
      className="toast-container"
      style={{
        position: 'fixed',
        top: '20px',
        right: '24px',
        zIndex: 9999,
        maxWidth: '420px',
        width: 'calc(100vw - 48px)',
        background: 'rgba(24, 24, 27, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${badge.border}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 25px -5px rgba(16, 185, 129, 0.15)',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        animation: 'slideInToast 350ms var(--ease-out)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: badge.color,
              background: badge.bg,
              border: `1px solid ${badge.border}`,
              letterSpacing: '0.04em',
            }}
          >
            {badge.label}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Agora mesmo • WebSocket
          </span>
        </div>

        <button
          onClick={dismissToast}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '4px',
          }}
          title="Fechar notificação"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {activeToast.titulo}
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          {activeToast.mensagem}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
        <button
          onClick={dismissToast}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          Dispensar
        </button>
        {activeToast.link_acao && (
          <button
            onClick={handleAction}
            style={{
              padding: '6px 12px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 600,
              color: '#052e16',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Ver no Módulo</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
