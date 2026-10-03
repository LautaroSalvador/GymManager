import type { ApiResponse } from '../types/api.types';

// La API siempre se llama con una ruta relativa (mismo origen):
// - En desarrollo, Vite proxea /api → localhost:3000 (ver vite.config.ts).
// - En producción, Vercel reescribe /api/* hacia el backend en Render (ver vercel.json).
const API_BASE = '/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    
    // Default to JSON headers
    const headers = new Headers(options.headers || {});
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
      credentials: 'include', // Crucial for HTTP-only cookies
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        // Handle unauthorized session expiration
        if (response.status === 401) {
          // Trigger a redirect to login by throwing or custom event
          window.dispatchEvent(new CustomEvent('auth-unauthorized'));
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      if (data.success && data.data !== undefined) {
        return data.data;
      }
      
      return data as T;
    } catch (error: unknown) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }
}

export const api = new ApiClient();
