import { api } from '../api/client';

export interface OcorrenciaSanitariaApi {
  id: string;
  propriedade_id: string;
  talhao_id?: string | null;
  tipo_ameaca: 'PRAGA' | 'DOENCA' | 'PLANTA_DANINHA' | string;
  agente_identificado: string;
  severidade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA' | string;
  latitude: number;
  longitude: number;
  observado_em: string;
  foto_url?: string | null;
  observacoes?: string | null;
  notificar_orgao_defesa?: boolean;
}

export interface AlertaEpidemiologicoApi {
  id: string;
  propriedade_id: string;
  agente: string;
  nivel: 'ALERTA' | 'PERIGO' | 'EMERGENCIA' | string;
  mensagem: string;
  raio_km: number;
  gerado_em: string;
  ativo: boolean;
}

export interface PontoCalorApi {
  latitude: number;
  longitude: number;
  peso: number;
  agente: string;
  severidade: string;
}

export interface MapaCalorApi {
  pontos: PontoCalorApi[];
  total_ocorrencias: number;
  gerado_em: string;
}

export const epidemiologicoService = {
  async getOcorrencias(agente?: string): Promise<{ items: OcorrenciaSanitariaApi[]; total: number }> {
    const query = agente ? `?agente=${encodeURIComponent(agente)}` : '';
    return api.get<{ items: OcorrenciaSanitariaApi[]; total: number }>(`/epidemiologico/ocorrencias${query}`);
  },

  async createOcorrencia(data: {
    talhao_id?: string;
    tipo_ameaca: string;
    agente_identificado: string;
    severidade: string;
    latitude: number;
    longitude: number;
    observado_em: string;
    foto_url?: string;
    observacoes?: string;
    notificar_orgao_defesa?: boolean;
  }): Promise<OcorrenciaSanitariaApi> {
    return api.post<OcorrenciaSanitariaApi>('/epidemiologico/ocorrencias', data);
  },

  async getAlertas(): Promise<AlertaEpidemiologicoApi[]> {
    return api.get<AlertaEpidemiologicoApi[]>('/epidemiologico/alertas');
  },

  async getMapaCalor(params?: {
    agente?: string;
    severidade?: string;
    min_lat?: number;
    max_lat?: number;
    min_lon?: number;
    max_lon?: number;
  }): Promise<MapaCalorApi> {
    const search = new URLSearchParams();
    if (params?.agente) search.set('agente', params.agente);
    if (params?.severidade) search.set('severidade', params.severidade);
    if (params?.min_lat !== undefined) search.set('min_lat', params.min_lat.toString());
    if (params?.max_lat !== undefined) search.set('max_lat', params.max_lat.toString());
    if (params?.min_lon !== undefined) search.set('min_lon', params.min_lon.toString());
    if (params?.max_lon !== undefined) search.set('max_lon', params.max_lon.toString());

    const qs = search.toString() ? `?${search.toString()}` : '';
    return api.get<MapaCalorApi>(`/epidemiologico/mapa-calor${qs}`);
  },
};
