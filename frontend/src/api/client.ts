/**
 * Cliente HTTP da API do Seed
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('seed_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (token === 'demo-token') {
      throw new ApiError(401, 'Modo de demonstração offline');
    }
    // Limpa token inválido ou expirado
    localStorage.removeItem('seed_token');
    localStorage.removeItem('seed_user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new ApiError(401, 'Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    let errorDetail = 'Erro ao processar requisição';
    let data;
    try {
      data = await response.json();
      errorDetail = data.detail || data.message || errorDetail;
    } catch {
      // Ignora erro de parse de json
    }
    throw new ApiError(response.status, errorDetail, data);
  }

  // Tratamento para 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export async function downloadBlob(endpoint: string, fallbackFilename: string): Promise<void> {
  const token = localStorage.getItem('seed_token');
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Erro ao baixar arquivo';
    try {
      const data = await response.json();
      errorDetail = data.detail || data.message || errorDetail;
    } catch {
      // Ignora erro de parse de json
    }
    throw new ApiError(response.status, errorDetail);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition');
  let filename = fallbackFilename;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) {
      filename = match[1].trim();
    }
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export const api = {
  get: <T>(url: string, headers?: Record<string, string>) =>
    request<T>(url, { method: 'GET', headers }),
  post: <T>(url: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(url, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    }),
  patch: <T>(url: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(url, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    }),
  delete: <T>(url: string, headers?: Record<string, string>) =>
    request<T>(url, { method: 'DELETE', headers }),
  download: (url: string, fallbackFilename: string) =>
    downloadBlob(url, fallbackFilename),
};

