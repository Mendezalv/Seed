import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import type { Notification, NotificationSeverity } from '../../types/notification';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'TODAS' | 'NAO_LIDAS'>('TODAS');
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fecha ao clicar fora
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'NAO_LIDAS') return !n.lida;
    return true;
  });

  const getSeverityStyle = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'CRITICA':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: '#ef4444', label: 'CRÍTICA' };
      case 'ALTA':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b', label: 'ALTA' };
      case 'MEDIA':
        return { color: '#eab308', bg: 'rgba(234, 179, 8, 0.12)', border: '#eab308', label: 'MÉDIA' };
      default:
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981', label: 'INFO' };
    }
  };

  const getTypeIcon = (tipo: Notification['tipo']) => {
    switch (tipo) {
      case 'EPIDEMIOLOGICO':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'MANUTENCAO':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'ESTOQUE':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Agora';
    if (diffMin < 60) return `há ${diffMin} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    return `há ${diffDays}d`;
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.lida) {
      markAsRead(notif.id);
    }
    onClose();
    if (notif.link_acao) {
      navigate(notif.link_acao);
    }
  };

  return (
    <div
      ref={popoverRef}
      className="notif-popover"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: '0',
        width: '420px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: '560px',
        background: '#18181b',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 20px rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        overflow: 'hidden',
        animation: 'fadeInScale 200ms var(--ease-out)',
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          padding: '16px 18px 12px',
          borderBottom: '1px solid var(--border)',
          background: '#18181b',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Notificações
            </span>
            {unreadCount > 0 && (
              <span
                style={{
                  background: 'var(--accent-muted)',
                  color: 'var(--accent-text)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '1px 7px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Status WebSocket */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                color: isConnected ? 'var(--accent-text)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
              title={isConnected ? 'Conexão WebSocket ativa' : 'Desconectado do servidor WebSocket'}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isConnected ? 'var(--accent)' : 'var(--text-muted)',
                  boxShadow: isConnected ? '0 0 8px var(--accent)' : 'none',
                }}
              />
              <span>{isConnected ? 'Ao vivo' : 'Offline'}</span>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  textDecoration: 'underline',
                }}
                title="Marcar todas como lidas"
              >
                Ler todas
              </button>
            )}
          </div>
        </div>

        {/* Abas de Filtro */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('TODAS')}
            style={{
              flex: 1,
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 500,
              background: activeTab === 'TODAS' ? 'var(--bg-hover)' : 'transparent',
              color: activeTab === 'TODAS' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: '1px solid',
              borderColor: activeTab === 'TODAS' ? 'var(--border)' : 'transparent',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>Todas</span>
            <span style={{ fontSize: '10px', opacity: 0.7, fontFamily: 'var(--font-mono)' }}>
              ({notifications.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('NAO_LIDAS')}
            style={{
              flex: 1,
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 500,
              background: activeTab === 'NAO_LIDAS' ? 'var(--bg-hover)' : 'transparent',
              color: activeTab === 'NAO_LIDAS' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: '1px solid',
              borderColor: activeTab === 'NAO_LIDAS' ? 'var(--border)' : 'transparent',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>Não Lidas</span>
            <span style={{ fontSize: '10px', opacity: 0.7, fontFamily: 'var(--font-mono)' }}>
              ({unreadCount})
            </span>
          </button>
        </div>
      </div>

      {/* Lista com Rolagem */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '360px',
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {filteredNotifications.length === 0 ? (
          <div
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--text-muted)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--bg-surface)',
                display: 'grid',
                placeItems: 'center',
                border: '1px solid var(--border)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span style={{ fontSize: '13px' }}>Nenhuma notificação {activeTab === 'NAO_LIDAS' ? 'pendente' : 'registrada'}</span>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const sev = getSeverityStyle(notif.severidade);
            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: notif.lida ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid',
                  borderColor: notif.lida ? 'transparent' : 'var(--border)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                  transition: 'background 160ms ease, border-color 160ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = notif.lida ? 'transparent' : 'rgba(255, 255, 255, 0.02)';
                }}
              >
                {/* Ícone de Categoria */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: sev.bg,
                    color: sev.color,
                    border: `1px solid ${sev.border}`,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getTypeIcon(notif.tipo)}
                </div>

                {/* Conteúdo */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: notif.lida ? 500 : 600,
                          color: notif.lida ? 'var(--text-secondary)' : 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {notif.titulo}
                      </span>
                      {!notif.lida && (
                        <div
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: sev.color,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        flexShrink: 0,
                      }}
                    >
                      {formatRelativeTime(notif.created_at)}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {notif.mensagem}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rodapé: Atalho Central de Alertas */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Radar Agro 24/7
        </span>

        <button
          onClick={() => {
            onClose();
            navigate('/vigilancia');
          }}
          style={{
            padding: '5px 12px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--accent-text)',
            fontSize: '11px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 150ms ease',
          }}
          title="Acessar a central de vigilância fitossanitária e monitoramento de pragas"
        >
          <span>Central de Alertas</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
