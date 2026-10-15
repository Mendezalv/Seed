import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cotacoesService, INITIAL_COTACOES } from '../services/cotacoesService';
import type { CotacaoItem } from '../services/cotacoesService';

interface CotacoesContextData {
  cotacoes: CotacaoItem[];
  isLoading: boolean;
  isSimulating: boolean;
  lastUpdate: string;
  simularAgora: () => Promise<void>;
  recarregar: () => Promise<void>;
}

const CotacoesContext = createContext<CotacoesContextData>({} as CotacoesContextData);

export const CotacoesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cotacoes, setCotacoes] = useState<CotacaoItem[]>(INITIAL_COTACOES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('Agora');

  const recarregar = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await cotacoesService.listar();
      if (data && data.length > 0) {
        setCotacoes(data);
        const agora = new Date();
        setLastUpdate(`${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const simularAgora = useCallback(async () => {
    setIsSimulating(true);
    try {
      const atualizadas = await cotacoesService.simular(0.012);
      if (atualizadas && atualizadas.length > 0) {
        setCotacoes(atualizadas);
        const agora = new Date();
        setLastUpdate(`${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}:${agora.getSeconds().toString().padStart(2, '0')}`);
      }
    } finally {
      setIsSimulating(false);
    }
  }, []);

  useEffect(() => {
    recarregar();

    // Simulação sutil de mercado a cada 30 segundos
    const timer = setInterval(() => {
      simularAgora();
    }, 30000);

    return () => clearInterval(timer);
  }, [recarregar, simularAgora]);

  return (
    <CotacoesContext.Provider
      value={{
        cotacoes,
        isLoading,
        isSimulating,
        lastUpdate,
        simularAgora,
        recarregar,
      }}
    >
      {children}
    </CotacoesContext.Provider>
  );
};

export const useCotacoes = () => {
  return useContext(CotacoesContext);
};
