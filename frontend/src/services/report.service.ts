import api from './api';

export interface IncidentReport {
  id: number;
  incidentType: string;
  description: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  incidentDate: string;
  incidentTime: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

export const reportService = {
  createReport: async (data: Partial<IncidentReport>): Promise<IncidentReport> => {
    const res = await api.post('/reports', data);
    return res.data;
  },

  getUserReports: async (): Promise<IncidentReport[]> => {
    const res = await api.get('/reports');
    return res.data;
  },

  getReportById: async (id: number): Promise<IncidentReport> => {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },

  getAllReportsAdmin: async (): Promise<IncidentReport[]> => {
    const res = await api.get('/reports/admin/all');
    return res.data;
  },

  updateReportStatusAdmin: async (id: number, status: string, adminNotes?: string): Promise<IncidentReport> => {
    const res = await api.patch(`/reports/admin/${id}/status`, { status, adminNotes });
    return res.data;
  }
};
