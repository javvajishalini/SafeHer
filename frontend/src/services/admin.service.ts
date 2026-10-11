import api from './api';

export interface AdminStats {
  totalUsers: number;
  totalSosIncidents: number;
  activeSosRecords: number;
  totalIncidentReports: number;
  totalDiaryEntries: number;
}

export const adminService = {
  getDashboardStats: async (): Promise<AdminStats> => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  getAllUsers: async (): Promise<any[]> => {
    const res = await api.get('/admin/users');
    return res.data;
  },

  updateUserStatus: async (userId: number, status: string): Promise<any> => {
    const res = await api.patch(`/admin/users/${userId}/status`, { status });
    return res.data;
  },

  getAllSOS: async (): Promise<any[]> => {
    const res = await api.get('/admin/sos');
    return res.data;
  }
};
