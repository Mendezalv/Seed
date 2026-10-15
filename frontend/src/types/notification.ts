export type NotificationType =
  | 'EPIDEMIOLOGICO'
  | 'MANUTENCAO'
  | 'ESTOQUE'
  | 'CLIMA'
  | 'ESG'
  | 'SISTEMA';

export type NotificationSeverity = 'CRITICA' | 'ALTA' | 'MEDIA' | 'INFO';

export interface Notification {
  id: string;
  propriedade_id: string;
  tipo: NotificationType;
  titulo: string;
  mensagem: string;
  severidade: NotificationSeverity;
  lida: boolean;
  lida_em: string | null;
  link_acao: string | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  total_nao_lidas: number;
}
