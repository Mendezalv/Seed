/**
 * Gerenciador de Armazenamento Local IndexedDB para Operação 100% Offline no Campo.
 * 
 * Permite que a aplicação Seed funcione sem conexão com a internet,
 * armazenando operações de mutação na 'outbox' e dados em 'cache' local.
 */

export interface OfflineOperation {
  sync_id: string;
  entity_type: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entity_id: string;
  data: Record<string, unknown>;
  timestamp: string;
  conflict_strategy: 'LWW' | 'CRDT_COUNTER' | 'MANUAL_REVIEW';
  created_at: string;
  retry_count?: number;
}

export interface CachedEntity {
  id: string;
  entity_type: string;
  data: Record<string, unknown>;
  cached_at: string;
}

const DB_NAME = 'SeedAgroOfflineDB';
const DB_VERSION = 1;

class OfflineStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB não suportado no ambiente atual'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Fila de saída (outbox) para operações geradas offline
        if (!db.objectStoreNames.contains('outbox')) {
          const outboxStore = db.createObjectStore('outbox', { keyPath: 'sync_id' });
          outboxStore.createIndex('entity_type', 'entity_type', { unique: false });
          outboxStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Cache de entidades para leitura offline
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'id' });
          cacheStore.createIndex('entity_type', 'entity_type', { unique: false });
        }

        // Metadados do dispositivo e controle de versão
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // ── Outbox (Fila de Mutações Offline) ─────────────────────────────────

  async enqueueOperation(op: Omit<OfflineOperation, 'sync_id' | 'created_at'>): Promise<OfflineOperation> {
    const db = await this.getDB();
    const sync_id = crypto.randomUUID();
    const fullOp: OfflineOperation = {
      ...op,
      sync_id,
      created_at: new Date().toISOString(),
      retry_count: 0,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('outbox', 'readwrite');
      const store = tx.objectStore('outbox');
      const req = store.add(fullOp);

      req.onsuccess = () => resolve(fullOp);
      req.onerror = () => reject(req.error);
    });
  }

  async getPendingOperations(): Promise<OfflineOperation[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('outbox', 'readonly');
      const store = tx.objectStore('outbox');
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getPendingCount(): Promise<number> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('outbox', 'readonly');
      const store = tx.objectStore('outbox');
      const req = store.count();

      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => reject(req.error);
    });
  }

  async removeOperations(syncIds: string[]): Promise<void> {
    if (syncIds.length === 0) return;
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('outbox', 'readwrite');
      const store = tx.objectStore('outbox');

      for (const id of syncIds) {
        store.delete(id);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async clearOutbox(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('outbox', 'readwrite');
      const store = tx.objectStore('outbox');
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // ── Cache de Entidades ───────────────────────────────────────────────

  async setCachedEntity(entityType: string, id: string, data: Record<string, unknown>): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cache', 'readwrite');
      const store = tx.objectStore('cache');
      const req = store.put({
        id,
        entity_type: entityType,
        data,
        cached_at: new Date().toISOString(),
      });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getCachedEntities(entityType: string): Promise<Record<string, unknown>[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cache', 'readonly');
      const store = tx.objectStore('cache');
      const index = store.index('entity_type');
      const req = index.getAll(entityType);

      req.onsuccess = () => {
        const results = req.result as CachedEntity[];
        resolve(results.map((r) => r.data));
      };
      req.onerror = () => reject(req.error);
    });
  }

  // ── Metadados do Dispositivo ─────────────────────────────────────────

  async getMetadata<T = unknown>(key: string): Promise<T | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('metadata', 'readonly');
      const store = tx.objectStore('metadata');
      const req = store.get(key);

      req.onsuccess = () => resolve(req.result ? (req.result.value as T) : null);
      req.onerror = () => reject(req.error);
    });
  }

  async setMetadata(key: string, value: unknown): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('metadata', 'readwrite');
      const store = tx.objectStore('metadata');
      const req = store.put({ key, value });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();
