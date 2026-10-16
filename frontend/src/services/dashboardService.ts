import { api } from '../api/client';

export interface DashboardConsolidadoData {
  propriedade?: {
    id: string;
    nome: string;
    municipio?: string;
    estado?: string;
    area_total_hectares?: number;
    talhoes_ativos?: number;
    safras_ativas?: number;
    culturas?: string[];
  };
  clima?: {
    temperatura?: number;
    umidade?: number;
    precipitacao?: number;
    vento_kmh?: number;
    condicao?: string;
    ultima_leitura?: string;
  };
  financeiro?: {
    custo_insumos?: number;
    lotes_estoque?: number;
    lotes_baixo_estoque?: number;
    manutencao_acumulada?: number;
    ordens_concluidas?: number;
  };
  frota?: {
    ativas?: number;
    total?: number;
    em_manutencao?: number;
    ordens_pendentes?: number;
  };
  epidemiologico?: {
    score_risco?: number;
    nivel_risco?: string;
    alertas_ativos?: number;
    ocorrencias_30dias?: number;
    agentes?: Array<{ nome: string; ocorrencias: number; severidade: string }>;
  };
  sustentabilidade?: {
    emissoes_totais?: number;
    emissao_por_hectare?: number;
    energia_renovavel_pct?: number;
    ultimo_relatorio?: string;
  };
}

export const dashboardService = {
  async getConsolidado(): Promise<DashboardConsolidadoData> {
    return api.get<DashboardConsolidadoData>('/propriedades/minha/dashboard/consolidado');
  },

  async exportarPdf(): Promise<void> {
    return api.download('/propriedades/minha/dashboard/export/pdf', 'relatorio_executivo_fazenda.pdf');
  },

  async exportarXlsx(): Promise<void> {
    return api.download('/propriedades/minha/dashboard/export/xlsx', 'relatorio_executivo_fazenda.xlsx');
  },
};
