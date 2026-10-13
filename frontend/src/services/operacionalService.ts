import { api } from '../api/client';

export interface TalhaoApi {
  id: string;
  propriedade_id: string;
  nome: string;
  area_hectares: number;
  cultura_atual?: string | null;
  status: string;
}

export interface SafraApi {
  id: string;
  propriedade_id: string;
  talhao_id: string;
  cultura: string;
  variedade?: string | null;
  data_plantio: string;
  data_colheita?: string | null;
  produtividade_estimada?: number | null;
  produtividade_real?: number | null;
  status: string;
}

export interface LoteInsumoApi {
  id: string;
  propriedade_id: string;
  insumo_id: string;
  codigo_lote: string;
  quantidade_inicial: number;
  quantidade_atual: number;
  data_validade?: string | null;
  fornecedor?: string | null;
  entrada_em: string;
}

export interface MaquinarioApi {
  id: string;
  propriedade_id: string;
  nome: string;
  tipo: string;
  modelo?: string | null;
  ano_fabricacao?: number | null;
  horimetro_atual: number;
  intervalo_preventiva: number;
  proximo_servico_em?: number | null;
  status: string;
}

export interface OrdemManutencaoApi {
  id: string;
  propriedade_id: string;
  maquinario_id: string;
  tipo: string;
  descricao?: string | null;
  horimetro_na_abertura?: number | null;
  status: string;
  prioridade: string;
  concluida_em?: string | null;
  custo_estimado?: number | null;
  custo_real?: number | null;
}

export interface ViabilidadeApiRequest {
  safra_id: string;
  custo_mao_obra: number;
  custo_frete: number;
  custo_impostos: number;
  preco_mercado_saca?: number;
}

export interface ViabilidadeApiResponse {
  custo_total: number;
  custo_por_saca: number;
  break_even_sacas: number;
  margem_percentual: number;
  receita_bruta: number;
  lucro_liquido: number;
  cenarios: Array<{
    nome: string;
    preco_saca: number;
    receita_bruta: number;
    lucro_liquido: number;
    margem_percentual: number;
  }>;
}

export const operacionalService = {
  // Talhões
  async getTalhoes(): Promise<TalhaoApi[]> {
    return api.get<TalhaoApi[]>('/operacional/talhoes');
  },
  async createTalhao(data: { nome: string; area_hectares: number; cultura_atual?: string; status?: string }): Promise<TalhaoApi> {
    return api.post<TalhaoApi>('/operacional/talhoes', data);
  },
  async deleteTalhao(id: string): Promise<void> {
    return api.delete(`/operacional/talhoes/${id}`);
  },

  // Safras
  async getSafras(): Promise<SafraApi[]> {
    return api.get<SafraApi[]>('/operacional/safras');
  },
  async createSafra(data: {
    talhao_id: string;
    cultura: string;
    variedade?: string;
    data_plantio: string;
    produtividade_estimada?: number;
    status?: string;
  }): Promise<SafraApi> {
    return api.post<SafraApi>('/operacional/safras', data);
  },
  async updateSafra(id: string, data: Partial<SafraApi>): Promise<SafraApi> {
    return api.patch<SafraApi>(`/operacional/safras/${id}`, data);
  },

  // Insumos & Lotes
  async getLotes(): Promise<LoteInsumoApi[]> {
    return api.get<LoteInsumoApi[]>('/operacional/insumos/lotes');
  },
  async createLote(data: {
    insumo_id: string;
    codigo_lote: string;
    quantidade_inicial: number;
    quantidade_atual: number;
    entrada_em: string;
    data_validade?: string;
    fornecedor?: string;
  }): Promise<LoteInsumoApi> {
    return api.post<LoteInsumoApi>('/operacional/insumos/lotes', data);
  },
  async alocarInsumo(data: {
    lote_insumo_id: string;
    safra_id: string;
    talhao_id: string;
    quantidade: number;
    area_hectares: number;
    operador_id: string;
    aplicado_em: string;
  }) {
    return api.post('/operacional/insumos/alocacoes', data);
  },
  async getEstoquesBaixos(): Promise<LoteInsumoApi[]> {
    return api.get<LoteInsumoApi[]>('/operacional/insumos/estoques-baixos');
  },

  // Maquinários & Frotas
  async getMaquinarios(): Promise<MaquinarioApi[]> {
    return api.get<MaquinarioApi[]>('/operacional/maquinarios');
  },
  async createMaquinario(data: {
    nome: string;
    tipo: string;
    modelo?: string;
    ano_fabricacao?: number;
    horimetro_atual?: number;
    intervalo_preventiva?: number;
    status?: string;
  }): Promise<MaquinarioApi> {
    return api.post<MaquinarioApi>('/operacional/maquinarios', data);
  },
  async updateHorimetro(id: string, horas: number): Promise<MaquinarioApi> {
    return api.patch<MaquinarioApi>(`/operacional/maquinarios/${id}/horimetro?horas=${horas}`);
  },
  async getOrdensManutencao(status?: string): Promise<{ items: OrdemManutencaoApi[]; total: number }> {
    const query = status ? `?status=${status}` : '';
    return api.get<{ items: OrdemManutencaoApi[]; total: number }>(`/operacional/manutencao/ordens${query}`);
  },
  async createOrdemManutencao(data: {
    maquinario_id: string;
    tipo: string;
    descricao?: string;
    horimetro_na_abertura?: number;
    status?: string;
    prioridade?: string;
    custo_estimado?: number;
  }): Promise<OrdemManutencaoApi> {
    return api.post<OrdemManutencaoApi>('/operacional/manutencao/ordens', data);
  },
  async concluirOrdemManutencao(id: string, custoReal: number): Promise<OrdemManutencaoApi> {
    return api.patch<OrdemManutencaoApi>(`/operacional/manutencao/ordens/${id}/concluir?custo_real=${custoReal}`);
  },

  // Viabilidade
  async calcularViabilidade(data: ViabilidadeApiRequest): Promise<ViabilidadeApiResponse> {
    return api.post<ViabilidadeApiResponse>('/operacional/viabilidade/calcular', data);
  },
};
