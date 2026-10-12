import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export interface Usuario {
  id: string;
  email: string;
  nome_completo: string;
  propriedade_id: string;
  role: 'ADMIN' | 'GESTOR' | 'OPERADOR' | 'CONSULTOR' | string;
  ativo: boolean;
  created_at: string;
}

export interface Propriedade {
  id: string;
  nome: string;
  cnpj_cpf?: string | null;
  inscricao_estadual?: string | null;
  municipio?: string | null;
  estado?: string | null;
  area_total_hectares?: number | string | null;
  car_numero?: string | null;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

interface AuthContextType {
  user: Usuario | null;
  propriedade: Propriedade | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  loginDemo: (customUser?: Usuario, customPropriedade?: Propriedade) => void;
  logout: () => void;
  carregarPropriedade: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('seed_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [propriedade, setPropriedade] = useState<Propriedade | null>(() => {
    const saved = localStorage.getItem('seed_propriedade');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('seed_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const carregarPropriedade = async () => {
    try {
      const data = await api.get<Propriedade>('/propriedades/minha');
      setPropriedade(data);
      localStorage.setItem('seed_propriedade', JSON.stringify(data));
    } catch (err) {
      console.warn('Não foi possível carregar propriedade:', err);
    }
  };

  useEffect(() => {
    async function inicializarSessao() {
      const savedToken = localStorage.getItem('seed_token');
      if (savedToken) {
        if (savedToken === 'demo-token') {
          const savedUser = localStorage.getItem('seed_user');
          const savedProp = localStorage.getItem('seed_propriedade');
          if (savedUser) setUser(JSON.parse(savedUser));
          if (savedProp) setPropriedade(JSON.parse(savedProp));
          setIsLoading(false);
          return;
        }

        try {
          const userData = await api.get<Usuario>('/auth/me');
          setUser(userData);
          localStorage.setItem('seed_user', JSON.stringify(userData));
          await carregarPropriedade();
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    }

    inicializarSessao();
  }, []);

  const loginDemo = (customUser?: Usuario, customPropriedade?: Propriedade) => {
    const demoUser: Usuario = customUser || {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'rafael.costa@santamaria.com.br',
      nome_completo: 'Rafael Costa',
      propriedade_id: '00000000-0000-0000-0000-000000000001',
      role: 'GESTOR',
      ativo: true,
      created_at: new Date().toISOString(),
    };

    const demoPropriedade: Propriedade = customPropriedade || {
      id: '00000000-0000-0000-0000-000000000001',
      nome: 'Fazenda Santa Maria',
      municipio: 'Sorriso',
      estado: 'MT',
      area_total_hectares: 1420,
    };

    localStorage.setItem('seed_token', 'demo-token');
    localStorage.setItem('seed_user', JSON.stringify(demoUser));
    localStorage.setItem('seed_propriedade', JSON.stringify(demoPropriedade));

    setToken('demo-token');
    setUser(demoUser);
    setPropriedade(demoPropriedade);
  };

  const login = async (email: string, senha: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, senha });
    localStorage.setItem('seed_token', res.access_token);
    localStorage.setItem('seed_user', JSON.stringify(res.usuario));
    setToken(res.access_token);
    setUser(res.usuario);
    await carregarPropriedade();
  };

  const logout = () => {
    localStorage.removeItem('seed_token');
    localStorage.removeItem('seed_user');
    localStorage.removeItem('seed_propriedade');
    setToken(null);
    setUser(null);
    setPropriedade(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        propriedade,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        loginDemo,
        logout,
        carregarPropriedade,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
