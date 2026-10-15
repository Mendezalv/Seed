import { api } from '../api/client';
import type { Notification, NotificationListResponse } from '../types/notification';

export const notificationService = {
  async getNotifications(apenasNaoLidas = false, limit = 50): Promise<NotificationListResponse> {
    const query = new URLSearchParams({
      apenas_nao_lidas: String(apenasNaoLidas),
      limit: String(limit),
    });
    return api.get<NotificationListResponse>(`/notificacoes?${query.toString()}`);
  },

  async markAsRead(id: string): Promise<Notification> {
    return api.patch<Notification>(`/notificacoes/${id}/lida`, {});
  },

  async markAllAsRead(): Promise<{ status: string; atualizadas: number }> {
    return api.post<{ status: string; atualizadas: number }>('/notificacoes/marcar-todas-lidas', {});
  },

  async simulateAlert(payload: {
    tipo?: string;
    titulo: string;
    mensagem: string;
    severidade?: string;
    link_acao?: string;
  }): Promise<Notification> {
    return api.post<Notification>('/notificacoes/simular', payload);
  },
};
