import { api } from '../api/client';

export interface CotacaoItem {
  codigo: string;
  nome: string;
  preco: number;
  variacao_pct: number;
  tendencia: 'UP' | 'DOWN' | 'EQUAL';
  unidade: string;
  mercado?: string;
  preco_anterior?: number;
  minima_dia?: number;
  maxima_dia?: number;
  volume_contratos?: number;
  atualizado_em?: string;
}

export const INITIAL_COTACOES: CotacaoItem[] = [
  {
    codigo: 'SOJA',
    nome: 'Soja Paranaguá',
    preco: 138.40,
    variacao_pct: 0.8,
    tendencia: 'UP',
    unidade: 'R$/sc 60kg',
    mercado: 'CEPEA / ESALQ',
    preco_anterior: 137.30,
    minima_dia: 136.90,
    maxima_dia: 139.10,
    volume_contratos: 14200,
  },
  {
    codigo: 'MILHO',
    nome: 'Milho Campinas',
    preco: 59.20,
    variacao_pct: -0.3,
    tendencia: 'DOWN',
    unidade: 'R$/sc 60kg',
    mercado: 'CEPEA / B3',
    preco_anterior: 59.38,
    minima_dia: 58.70,
    maxima_dia: 59.80,
    volume_contratos: 8750,
  },
  {
    codigo: 'BOI',
    nome: 'Boi Gordo SP',
    preco: 242.50,
    variacao_pct: 1.2,
    tendencia: 'UP',
    unidade: 'R$/@',
    mercado: 'B3 / CEPEA',
    preco_anterior: 239.60,
    minima_dia: 239.00,
    maxima_dia: 243.20,
    volume_contratos: 4320,
  },
  {
    codigo: 'CAFE',
    nome: 'Café Arábica Tipo 6',
    preco: 1150.00,
    variacao_pct: 0.5,
    tendencia: 'UP',
    unidade: 'R$/sc 60kg',
    mercado: 'CEPEA',
    preco_anterior: 1144.20,
    minima_dia: 1135.00,
    maxima_dia: 1158.00,
    volume_contratos: 2800,
  },
  {
    codigo: 'DOLAR',
    nome: 'Dólar Comercial',
    preco: 5.42,
    variacao_pct: -0.4,
    tendencia: 'DOWN',
    unidade: 'R$',
    mercado: 'Banco Central / PTAX',
    preco_anterior: 5.44,
    minima_dia: 5.39,
    maxima_dia: 5.46,
    volume_contratos: 32000,
  },
];

export const cotacoesService = {
  async listar(): Promise<CotacaoItem[]> {
    try {
      const data = await api.get<CotacaoItem[]>('/cotacoes/');
      return data || INITIAL_COTACOES;
    } catch {
      return INITIAL_COTACOES;
    }
  },

  async simular(volatilidade: number = 0.015): Promise<CotacaoItem[]> {
    try {
      const response = await api.post<{ status: string; cotacoes: CotacaoItem[] }>(`/cotacoes/simular?volatilidade=${volatilidade}`);
      return response.cotacoes || INITIAL_COTACOES;
    } catch {
      // Fallback local reativo para modo offline
      return INITIAL_COTACOES.map((item) => {
        const delta = (Math.random() * 2 - 1) * volatilidade;
        const novoPreco = Number((item.preco * (1 + delta)).toFixed(2));
        const variacao = Number((((novoPreco - (item.preco_anterior || item.preco)) / (item.preco_anterior || item.preco)) * 100).toFixed(2));
        return {
          ...item,
          preco: novoPreco,
          preco_anterior: item.preco,
          variacao_pct: variacao,
          tendencia: novoPreco > item.preco ? 'UP' : (novoPreco < item.preco ? 'DOWN' : 'EQUAL'),
          atualizado_em: new Date().toISOString(),
        };
      });
    }
  },

  async obterHistorico(codigo: string, dias: number = 7): Promise<{ codigo: string; dias: number; pontos: unknown[] }> {
    try {
      return await api.get<{ codigo: string; dias: number; pontos: unknown[] }>(`/cotacoes/historico/${codigo}?dias=${dias}`);
    } catch {
      return { codigo, dias, pontos: [] };
    }
  },

  async exportarXlsx(): Promise<void> {
    return api.download('/cotacoes/export/xlsx', 'boletim_cotacoes_seed.xlsx');
  },

  async exportarPdf(): Promise<void> {
    return api.download('/cotacoes/export/pdf', 'boletim_mercado_seed.pdf');
  },
};

