import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { syncService } from '../services/syncService';
import { offlineStorage, type OfflineOperation } from '../services/offlineStorage';

interface SyncContextValue {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: string | null;
  serverVersion: number;
  syncError: string | null;
  syncNow: () => Promise<void>;
  queueOperation: (
    entityType: string,
    operation: 'CREATE' | 'UPDATE' | 'DELETE',
    entityId: string,
    data: Record<string, unknown>,
    conflictStrategy?: 'LWW' | 'CRDT_COUNTER' | 'MANUAL_REVIEW'
  ) => Promise<OfflineOperation>;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [serverVersion, setServerVersion] = useState<number>(0);
  const [syncError, setSyncError] = useState<string | null>(null);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await offlineStorage.getPendingCount();
      setPendingCount(count);
    } catch {
      // Ignora erro de IndexedDB em testes
    }
  }, []);

  const loadInitialMetadata = useCallback(async () => {
    try {
      const ver = await syncService.getLastKnownServerVersion();
      setServerVersion(ver);

      const lastTs = await offlineStorage.getMetadata<string>('last_sync_timestamp');
      if (lastTs) {
        setLastSyncAt(new Date(lastTs).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      }
      await refreshPendingCount();
    } catch {
      // Ignora erro
    }
  }, [refreshPendingCount]);

  const syncNow = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncError(null);

    try {
      const result = await syncService.synchronize();
      setServerVersion(result.newVersion);
      const nowFormatted = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLastSyncAt(nowFormatted);
      await refreshPendingCount();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão com servidor';
      setSyncError(msg);
      console.info('Aviso de sincronização (modo offline mantido):', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshPendingCount]);

  // Enfileira alteração e tenta sincronizar se online
  const queueOperation = useCallback(
    async (
      entityType: string,
      operation: 'CREATE' | 'UPDATE' | 'DELETE',
      entityId: string,
      data: Record<string, unknown>,
      conflictStrategy: 'LWW' | 'CRDT_COUNTER' | 'MANUAL_REVIEW' = 'LWW'
    ) => {
      const queued = await syncService.queueOperation(
        entityType,
        operation,
        entityId,
        data,
        conflictStrategy
      );
      await refreshPendingCount();

      // Se estiver online, tenta enviar imediatamente em segundo plano
      if (navigator.onLine) {
        syncNow().catch(() => {});
      }

      return queued;
    },
    [refreshPendingCount, syncNow]
  );

  // Monitoramento de conexão online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync automático ao reconectar
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadInitialMetadata();

    // Sincronização periódica a cada 60 segundos se online
    const interval = setInterval(() => {
      if (navigator.onLine) {
        syncNow();
      }
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [loadInitialMetadata, syncNow]);

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingCount,
        lastSyncAt,
        serverVersion,
        syncError,
        syncNow,
        queueOperation,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = (): SyncContextValue => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync deve ser utilizado dentro de um SyncProvider');
  }
  return context;
};
