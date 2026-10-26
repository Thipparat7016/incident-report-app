import type { CreateIncidentPayload, Incident, IncidentStats, UpdateIncidentPayload } from '../types/incident';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorMessage = errorData.error + (errorData.details ? `: ${errorData.details}` : '');
      }
    } catch {
      // not JSON
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  async getIncidents(search?: string, category?: string, status?: string): Promise<Incident[]> {
    const params = new URLSearchParams();
    if (search && search.trim()) params.append('q', search.trim());
    if (category && category !== 'All' && category !== 'All categories') params.append('category', category);
    if (status && status !== 'All' && status !== 'All statuses') params.append('status', status);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/incidents${queryString}`);
    return handleResponse<Incident[]>(res);
  },

  async getIncident(id: number): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/incidents/${id}`);
    return handleResponse<Incident>(res);
  },

  async createIncident(payload: CreateIncidentPayload): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<Incident>(res);
  },

  async updateIncident(id: number, payload: UpdateIncidentPayload): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/incidents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<Incident>(res);
  },

  async deleteIncident(id: number): Promise<{ message: string; id: number }> {
    const res = await fetch(`${API_BASE_URL}/incidents/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string; id: number }>(res);
  },

  async getStats(): Promise<IncidentStats> {
    const res = await fetch(`${API_BASE_URL}/stats`);
    return handleResponse<IncidentStats>(res);
  },
};
