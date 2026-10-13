import { api } from '../api/client';

export interface ConsumoEnergiaApi {
  id: string;
  propriedade_id: string;
  fonte_id: string;
  equipamento_id?: string | null;
  quantidade_consumida: number;
  custo_total: number;
  apurado_em: string;
}

export interface FonteMatrizApi {
  nome: string;
  tipo: 'RENOVAVEL' | 'FOSSIL' | string;
  consumo_kwh_equivalente: number;
  emissao_tco2e: number;
  percentual: number;
}

export interface MatrizEnergeticaApi {
  periodo: string;
  total_kwh_equivalente: number;
  percentual_renovavel: number;
  emissoes_totais_tco2e: number;
  fontes: FonteMatrizApi[];
}

export interface RelatorioESGApi {
  id: string;
  propriedade_id: string;
  periodo_referencia: string;
  emissoes_escopo1_tco2e: number;
  emissoes_escopo2_tco2e: number;
  emissoes_totais_tco2e: number;
  intensidade_carbono_por_hectare: number;
  percentual_energia_renovavel: number;
  status: 'RASCUNHO' | 'HOMOLOGADO' | 'PUBLICADO' | string;
  score_abc_mais?: string | null;
  bonus_juros_estimado?: number | null;
  created_at: string;
}

export interface LaudoCreditoVerdeApi {
  laudo_numero: string;
  propriedade: {
    nome: string;
    car_numero?: string;
    area_total_ha?: number;
  };
  periodo: string;
  matriz_renovavel_pct: number;
  emissoes_totais_tco2e: number;
  intensidade_tco2e_ha: number;
  elegibilidade_abc_plus: boolean;
  rating_score: string;
  bonus_taxa_juros: string;
  economia_estimada_ano: number;
  cbios_gerados: number;
  data_emissao: string;
  status: string;
}

export const energeticoService = {
  async getMatrizEnergetica(periodo?: string): Promise<MatrizEnergeticaApi> {
    const qs = periodo ? `?periodo=${periodo}` : '';
    return api.get<MatrizEnergeticaApi>(`/energetico/matriz-energetica${qs}`);
  },

  async createConsumo(data: {
    fonte_id: string;
    equipamento_id?: string;
    quantidade_consumida: number;
    custo_total: number;
    apurado_em: string;
  }): Promise<ConsumoEnergiaApi> {
    return api.post<ConsumoEnergiaApi>('/energetico/consumos', data);
  },

  async getRelatorios(): Promise<{ items: RelatorioESGApi[]; total: number }> {
    return api.get<{ items: RelatorioESGApi[]; total: number }>('/energetico/relatorios');
  },

  async gerarRelatorio(periodo: string): Promise<RelatorioESGApi> {
    return api.post<RelatorioESGApi>(`/energetico/relatorios/gerar?periodo=${periodo}`);
  },

  async publicarRelatorio(id: string): Promise<RelatorioESGApi> {
    return api.patch<RelatorioESGApi>(`/energetico/relatorios/${id}/publicar`);
  },

  async getLaudoCreditoVerde(id: string): Promise<LaudoCreditoVerdeApi> {
    return api.get<LaudoCreditoVerdeApi>(`/energetico/relatorios/${id}/laudo-credito-verde`);
  },

  async exportarLaudoPdf(id?: string): Promise<void> {
    const url = id ? `/energetico/relatorios/${id}/export/pdf` : '/energetico/relatorios/export/pdf';
    return api.download(url, 'laudo_credito_verde_esg.pdf');
  },
};

