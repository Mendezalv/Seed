import { api } from '../api/client';
import { offlineStorage, type OfflineOperation } from './offlineStorage';

export interface SyncOperationPayload {
  sync_id: string;
  entity_type: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entity_id: string;
  data: Record<string, unknown>;
  timestamp: string;
  conflict_strategy: 'LWW' | 'CRDT_COUNTER' | 'MANUAL_REVIEW';
}

export interface SyncEnvelopePayload {
  envelope_id: string;
  device_id: string;
  propriedade_id: string;
  usuario_id: string;
  last_known_server_version: number;
  device_version_vector: Record<string, number>;
  operacoes: SyncOperationPayload[];
  checksum_sha256: string;
  compressed: boolean;
  created_at: string;
  sent_at: string;
}

export interface SyncResultResponse {
  envelope_id: string;
  operations_applied: number;
  operations_skipped: number;
  conflicts_resolved: number;
  conflicts_pending_review: number;
  new_server_version: number;
  details: Array<Record<string, unknown>>;
}

export interface PullChangesResponse {
  current_server_version: number;
  since_version: number;
  total_changes: number;
  changes: Array<{
    entity_type: string;
    entity_id: string;
    operation: string;
    data: Record<string, unknown>;
    updated_at: string;
  }>;
}

export interface SyncStatusResponse {
  current_version: number;
  last_sync_at: string | null;
  pending_reviews_count: number;
}

// Utilitário para SHA-256 no browser
async function computeSha256(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

class SyncService {
  private deviceIdPromise: Promise<string> | null = null;

  async getDeviceId(): Promise<string> {
    if (this.deviceIdPromise) return this.deviceIdPromise;

    this.deviceIdPromise = (async () => {
      const stored = await offlineStorage.getMetadata<string>('device_id');
      if (stored) return stored;

      const newId = `device-${crypto.randomUUID()}`;
      await offlineStorage.setMetadata('device_id', newId);
      return newId;
    })();

    return this.deviceIdPromise;
  }

  async getLastKnownServerVersion(): Promise<number> {
    const ver = await offlineStorage.getMetadata<number>('last_server_version');
    return typeof ver === 'number' ? ver : 0;
  }

  async setLastKnownServerVersion(ver: number): Promise<void> {
    await offlineStorage.setMetadata('last_server_version', ver);
  }

  /**
   * Enfileira uma mutação para envio posterior ou imediato.
   */
  async queueOperation(
    entityType: string,
    operation: 'CREATE' | 'UPDATE' | 'DELETE',
    entityId: string,
    data: Record<string, unknown>,
    conflictStrategy: 'LWW' | 'CRDT_COUNTER' | 'MANUAL_REVIEW' = 'LWW'
  ): Promise<OfflineOperation> {
    // 1. Persiste na outbox local do IndexedDB
    const queued = await offlineStorage.enqueueOperation({
      entity_type: entityType,
      operation,
      entity_id: entityId,
      data,
      timestamp: new Date().toISOString(),
      conflict_strategy: conflictStrategy,
    });

    // 2. Atualiza o cache local imediatamente para leitura offline instantânea
    await offlineStorage.setCachedEntity(entityType, entityId, data);

    return queued;
  }

  /**
   * Envia as operações pendentes da outbox para a rota /sync/push do backend.
   */
  async push(): Promise<SyncResultResponse | null> {
    const pending = await offlineStorage.getPendingOperations();
    if (pending.length === 0) return null;

    const deviceId = await this.getDeviceId();
    const lastVersion = await this.getLastKnownServerVersion();
    const envelopeId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const operacoesPayload: SyncOperationPayload[] = pending.map((p) => ({
      sync_id: p.sync_id,
      entity_type: p.entity_type,
      operation: p.operation,
      entity_id: p.entity_id,
      data: p.data,
      timestamp: p.timestamp,
      conflict_strategy: p.conflict_strategy,
    }));

    // Calcula checksum SHA-256 do payload
    const rawContent = JSON.stringify(operacoesPayload);
    const checksum = await computeSha256(rawContent);

    const envelope: SyncEnvelopePayload = {
      envelope_id: envelopeId,
      device_id: deviceId,
      propriedade_id: '01a13745-d7c3-71c0-8ff5-4a5cde96611d', // Fazenda Santa Maria padrão
      usuario_id: '01a13745-d7c7-71b5-85c8-1004bb4f24c3',     // Usuário padrão
      last_known_server_version: lastVersion,
      device_version_vector: { [deviceId]: pending.length },
      operacoes: operacoesPayload,
      checksum_sha256: checksum,
      compressed: false,
      created_at: nowIso,
      sent_at: nowIso,
    };

    try {
      const result = await api.post<SyncResultResponse>('/sync/push', envelope);

      // Marca operações enviadas como concluídas removendo da outbox
      const syncIds = pending.map((p) => p.sync_id);
      await offlineStorage.removeOperations(syncIds);

      // Atualiza versão do servidor no IndexedDB
      if (result.new_server_version) {
        await this.setLastKnownServerVersion(result.new_server_version);
      }
      await offlineStorage.setMetadata('last_sync_timestamp', nowIso);

      return result;
    } catch (err) {
      console.warn('Falha ao enviar SyncEnvelope para /sync/push (mantendo na fila offline):', err);
      throw err;
    }
  }

  /**
   * Busca alterações no servidor desde a última versão conhecida pelo dispositivo (/sync/pull).
   */
  async pull(): Promise<PullChangesResponse> {
    const lastVersion = await this.getLastKnownServerVersion();

    try {
      const response = await api.get<PullChangesResponse>(`/sync/pull?since_version=${lastVersion}`);

      // Atualiza o cache local com os deltas recebidos
      if (response.changes && response.changes.length > 0) {
        for (const change of response.changes) {
          await offlineStorage.setCachedEntity(change.entity_type, change.entity_id, change.data);
        }
      }

      if (response.current_server_version) {
        await this.setLastKnownServerVersion(response.current_server_version);
      }
      await offlineStorage.setMetadata('last_sync_timestamp', new Date().toISOString());

      return response;
    } catch (err) {
      console.warn('Falha ao obter deltas do servidor em /sync/pull:', err);
      throw err;
    }
  }

  /**
   * Consulta status de sincronização e versões pendentes.
   */
  async getStatus(): Promise<SyncStatusResponse> {
    return api.get<SyncStatusResponse>('/sync/status');
  }

  /**
   * Ciclo completo de sincronização bidirecional: Push de alterações locais seguido de Pull de deltas do servidor.
   */
  async synchronize(): Promise<{
    pushedCount: number;
    pulledCount: number;
    newVersion: number;
  }> {
    let pushedCount = 0;
    let newVersion = await this.getLastKnownServerVersion();

    // 1. Push
    try {
      const pushResult = await this.push();
      if (pushResult) {
        pushedCount = pushResult.operations_applied;
        newVersion = pushResult.new_server_version;
      }
    } catch (err) {
      console.info('Aviso no push (continuando ciclo se possível):', err);
    }

    // 2. Pull
    let pulledCount = 0;
    try {
      const pullResult = await this.pull();
      pulledCount = pullResult.total_changes;
      newVersion = pullResult.current_server_version;
    } catch (err) {
      console.info('Aviso no pull:', err);
    }

    return {
      pushedCount,
      pulledCount,
      newVersion,
    };
  }
}

export const syncService = new SyncService();
