import api from './api';

// SafeHer – Safety Diary service
// Uses the shared api.ts Axios instance (token injected by interceptor, not duplicated here).

export interface DiaryLocation {
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface DiaryEntry {
  id: number;
  title: string;
  description?: string;
  location?: DiaryLocation;
  incidentDate?: string;      // YYYY-MM-DD
  incidentTime?: string;      // HH:mm:ss
  incidentType?: string;
  riskLevel?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDiaryRequest {
  title: string;
  description?: string;
  /** Backend expects a Location object {address, latitude, longitude} */
  location?: DiaryLocation;
  incidentDate?: string;
  incidentTime?: string;
  incidentType?: string;
  riskLevel?: string;
}

export const diaryService = {
  getEntries: async (): Promise<DiaryEntry[]> => {
    const response = await api.get<DiaryEntry[]>('/diary');
    return response.data;
  },

  getEntry: async (id: number): Promise<DiaryEntry> => {
    const response = await api.get<DiaryEntry>(`/diary/${id}`);
    return response.data;
  },

  createEntry: async (data: CreateDiaryRequest): Promise<DiaryEntry> => {
    const response = await api.post<DiaryEntry>('/diary', data);
    return response.data;
  },

  updateEntry: async (id: number, data: CreateDiaryRequest): Promise<DiaryEntry> => {
    const response = await api.put<DiaryEntry>(`/diary/${id}`, data);
    return response.data;
  },

  deleteEntry: async (id: number): Promise<void> => {
    await api.delete(`/diary/${id}`);
  },

  searchEntries: async (q: string): Promise<DiaryEntry[]> => {
    const response = await api.get<DiaryEntry[]>('/diary/search', { params: { q } });
    return response.data;
  },
};

// AI diary analysis – uses the same shared api instance
export const aiDiaryService = {
  analyzeDiary: async () => {
    const response = await api.post('/ai/analyze-diary', {});
    return response.data;
  },
};
