import api from './api';

export interface SOSResponse {
  id: number;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  address?: string;
  timestamp?: string;
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  message?: string;
  mapsUrl?: string;
  createdAt?: string;
  resolvedAt?: string;
}

export interface ActivateSOSRequest {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  address?: string;
  message?: string;
  contactIds?: number[];
}

export const sosService = {
  activateSOS: async (data: ActivateSOSRequest): Promise<SOSResponse> => {
    const response = await api.post<SOSResponse>('/sos', data);
    return response.data;
  },

  getHistory: async (): Promise<SOSResponse[]> => {
    const response = await api.get<SOSResponse[]>('/sos/history');
    return response.data;
  },

  // Alias for backward compatibility with existing views
  getSOSHistory: async (): Promise<SOSResponse[]> => {
    return sosService.getHistory();
  },

  getActiveSOS: async (): Promise<SOSResponse | undefined> => {
    try {
      const history = await sosService.getHistory();
      return history.find((incident) => incident.status === 'ACTIVE');
    } catch (e) {
      return undefined;
    }
  },

  resolveSOS: async (id: number): Promise<SOSResponse> => {
    const response = await api.patch<SOSResponse>(`/sos/${id}/resolve`, {});
    return response.data;
  },

  cancelSOS: async (id: number): Promise<SOSResponse> => {
    const response = await api.patch<SOSResponse>(`/sos/${id}/cancel`, {});
    return response.data;
  }
};
