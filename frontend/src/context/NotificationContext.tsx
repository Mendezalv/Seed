import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { Notification, NotificationSeverity } from '../types/notification';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationContextData {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  activeToast: Notification | null;
  dismissToast: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  simulateAlert: (
    tipo: string,
    titulo: string,
    mensagem: string,
    severidade?: NotificationSeverity,
    linkAcao?: string
  ) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

// Notificações padrão de fallback para modo demo ou inicial
const DEFAULT_DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'demo-notif-1',
    propriedade_id: 'demo-prop',
    tipo: 'EPIDEMIOLOGICO',
    titulo: 'Alerta Fitossanitário: Ferrugem Asiática',
    mensagem: 'Condições microclimáticas críticas no Talhão 04 (molhamento > 10h). Inspecione a área.',
    severidade: 'CRITICA',
    lida: false,
    lida_em: null,
    link_acao: '/vigilancia',
    metadata_json: null,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'demo-notif-2',
    propriedade_id: 'demo-prop',
    tipo: 'MANUTENCAO',
    titulo: 'Manutenção Preventiva Próxima',
    mensagem: 'Trator John Deere 8R atingiu 485h (limite 500h). Agende a troca de filtros e óleo.',
    severidade: 'ALTA',
    lida: false,
    lida_em: null,
    link_acao: '/maquinarios',
    metadata_json: null,
    created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
  {
    id: 'demo-notif-3',
    propriedade_id: 'demo-prop',
    tipo: 'ESTOQUE',
    titulo: 'Estoque Baixo de Insumo',
    mensagem: 'Lote de Fungicida Fox Xpro com apenas 15% da capacidade inicial. Reabasteça o depósito.',
    severidade: 'MEDIA',
    lida: false,
    lida_em: null,
    link_acao: '/insumos',
    metadata_json: null,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'demo-notif-4',
    propriedade_id: 'demo-prop',
    tipo: 'ESG',
    titulo: 'Certificação ABC+ Aprovada',
    mensagem: 'Laudo de conformidade homologado: Matriz 78.5% renovável (-1.0% a.a. juros verdes).',
    severidade: 'INFO',
    lida: true,
    lida_em: new Date().toISOString(),
    link_acao: '/energia-esg',
    metadata_json: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
];

// Efeito sonoro sintetizado via Web Audio API (sem dependências externas)
function playNotificationChime(isCritical: boolean) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isCritical ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isCritical ? 880 : 587.33, ctx.currentTime); // A5 ou D5
    if (isCritical) {
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.15); // D6
    }

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Ignora restrições de autoplay do browser
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_DEMO_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState<number>(3);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const heartbeatIntervalRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  }, []);

  const triggerToast = useCallback((notif: Notification) => {
    setActiveToast(notif);
    playNotificationChime(notif.severidade === 'CRITICA' || notif.severidade === 'ALTA');

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    // Auto-dismiss após 6 segundos
    toastTimeoutRef.current = window.setTimeout(() => {
      setActiveToast(null);
    }, 6000);
  }, []);

  const refresh = useCallback(async () => {
    if (!token || token === 'demo-token') {
      return;
    }
    try {
      const data = await notificationService.getNotifications(false, 50);
      setNotifications(data.items);
      setUnreadCount(data.total_nao_lidas);
    } catch {
      // Mantém lista atual se houver falha de rede temporária
    }
  }, [token]);

  // Marca notificação específica como lida
  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true, lida_em: new Date().toISOString() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    if (token && token !== 'demo-token') {
      try {
        await notificationService.markAsRead(id);
      } catch {
        // Fallback já aplicado localmente
      }
    }
  }, [token]);

  // Marca todas como lidas
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, lida: true, lida_em: new Date().toISOString() }))
    );
    setUnreadCount(0);

    if (token && token !== 'demo-token') {
      try {
        await notificationService.markAllAsRead();
      } catch {
        // Fallback já aplicado localmente
      }
    }
  }, [token]);

  // Emite notificação de teste/simulação
  const simulateAlert = useCallback(
    async (
      tipo: string,
      titulo: string,
      mensagem: string,
      severidade: NotificationSeverity = 'CRITICA',
      linkAcao = '/vigilancia'
    ) => {
      if (token && token !== 'demo-token') {
        try {
          const res = await notificationService.simulateAlert({
            tipo,
            titulo,
            mensagem,
            severidade,
            link_acao: linkAcao,
          });
          // Se o websocket estiver ativo, ele receberá via broadcast; caso contrário adiciona manualmente:
          if (!isConnected) {
            setNotifications((prev) => [res, ...prev]);
            setUnreadCount((prev) => prev + 1);
            triggerToast(res);
          }
          return;
        } catch {
          // Cai no fallback local se a API falhar
        }
      }

      // Notificação local demonstrativa (fallback offline)
      const novaNotif: Notification = {
        id: `local-sim-${Date.now()}`,
        propriedade_id: 'local-prop',
        tipo: tipo as Notification['tipo'],
        titulo,
        mensagem,
        severidade,
        lida: false,
        lida_em: null,
        link_acao: linkAcao,
        metadata_json: null,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [novaNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      triggerToast(novaNotif);
    },
    [token, isConnected, triggerToast]
  );

  // Conexão WebSocket em Tempo Real
  useEffect(() => {
    if (!isAuthenticated || !token || token === 'demo-token') {
      setIsConnected(false);
      return;
    }

    let isCleanedUp = false;

    const connectWebSocket = () => {
      if (isCleanedUp) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/v1/ws/notificacoes?token=${encodeURIComponent(token)}`;

      try {
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          if (isCleanedUp) {
            socket.close();
            return;
          }
          setIsConnected(true);

          // Inicia heartbeat (ping a cada 25 segundos)
          if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = window.setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'ping' }));
            }
          }, 25000);
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            if (message.type === 'NOTIFICATION' && message.data) {
              const nova: Notification = message.data;
              setNotifications((prev) => [nova, ...prev.filter((item) => item.id !== nova.id)]);
              setUnreadCount((prev) => prev + 1);
              triggerToast(nova);
            } else if (message.type === 'NOTIFICATION_READ' && message.data?.id) {
              setNotifications((prev) =>
                prev.map((n) => (n.id === message.data.id ? { ...n, lida: true } : n))
              );
              setUnreadCount((prev) => Math.max(0, prev - 1));
            } else if (message.type === 'ALL_NOTIFICATIONS_READ') {
              setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
              setUnreadCount(0);
            }
          } catch {
            // Ignora mensagens malformadas
          }
        };

        socket.onclose = () => {
          setIsConnected(false);
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
          }
          if (!isCleanedUp) {
            // Tenta reconexão em 5 segundos
            reconnectTimeoutRef.current = window.setTimeout(connectWebSocket, 5000);
          }
        };

        socket.onerror = () => {
          socket.close();
        };
      } catch {
        setIsConnected(false);
      }
    };

    refresh();
    connectWebSocket();

    return () => {
      isCleanedUp = true;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, token, refresh, triggerToast]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        activeToast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        simulateAlert,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser utilizado dentro de um NotificationProvider');
  }
  return context;
};
