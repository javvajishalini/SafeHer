import api from './api';

export interface EmergencyContactSummary {
  id: number;
  name: string;
  phoneNumber?: string;
  email?: string;
  relationship?: string;
  priority?: number;
}

export interface ActiveJourneySummary {
  id: number;
  title: string;
  startAddress?: string;
  destAddress?: string;
  status: string;
}

export interface SOSResponse {
  id: number;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  address?: string;
  timestamp?: string;
  sosType?: 'STANDARD' | 'IN_JOURNEY' | 'SILENT' | 'OVERDUE';
  journeyId?: number;
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  message?: string;
  mapsUrl?: string;
  createdAt?: string;
  resolvedAt?: string;
  emergencyContacts?: EmergencyContactSummary[];
  activeJourney?: ActiveJourneySummary;
}

export interface ActivateSOSRequest {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  address?: string;
  sosType?: 'STANDARD' | 'IN_JOURNEY' | 'SILENT' | 'OVERDUE';
  journeyId?: number;
  message?: string;
  emergencyContactIds?: number[];
  contactIds?: number[];
}

export const sosService = {
  activateSOS: async (data: ActivateSOSRequest): Promise<SOSResponse> => {
    // Ensure both field names are provided for safety
    const payload = {
      ...data,
      emergencyContactIds: data.emergencyContactIds || data.contactIds,
      contactIds: data.contactIds || data.emergencyContactIds
    };
    const response = await api.post<SOSResponse>('/sos', payload);
    return response.data;
  },

  getHistory: async (): Promise<SOSResponse[]> => {
    const response = await api.get<SOSResponse[]>('/sos/history');
    return response.data;
  },

  // Alias for backward compatibility
  getSOSHistory: async (): Promise<SOSResponse[]> => {
    return sosService.getHistory();
  },

  getActiveSOS: async (): Promise<SOSResponse | null> => {
    try {
      const response = await api.get<SOSResponse>('/sos/active');
      if (response.status === 204 || !response.data) return null;
      return response.data;
    } catch (e) {
      // Fallback to history check
      try {
        const history = await sosService.getHistory();
        return history.find((incident) => incident.status === 'ACTIVE') || null;
      } catch (err) {
        return null;
      }
    }
  },

  getSOSIncident: async (id: number): Promise<SOSResponse> => {
    const response = await api.get<SOSResponse>(`/sos/${id}`);
    return response.data;
  },

  resolveSOS: async (id: number): Promise<SOSResponse> => {
    const response = await api.post<SOSResponse>(`/sos/${id}/resolve`, {});
    return response.data;
  },

  cancelSOS: async (id: number): Promise<SOSResponse> => {
    const response = await api.post<SOSResponse>(`/sos/${id}/cancel`, {});
    return response.data;
  }
};
