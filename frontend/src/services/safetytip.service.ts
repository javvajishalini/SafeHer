import api from './api';

export interface SafetyTip {
  id: number;
  title: string;
  content: string;
  category: string;
  iconName?: string;
  displayOrder?: number;
  isActive: boolean;
}

export const safetyTipService = {
  getTips: async (category?: string): Promise<SafetyTip[]> => {
    const params = category ? { category } : {};
    const res = await api.get('/safety-tips', { params });
    return res.data;
  },

  getAllTipsAdmin: async (): Promise<SafetyTip[]> => {
    const res = await api.get('/safety-tips/admin');
    return res.data;
  },

  createTipAdmin: async (tip: Partial<SafetyTip>): Promise<SafetyTip> => {
    const res = await api.post('/safety-tips/admin', tip);
    return res.data;
  },

  updateTipAdmin: async (id: number, tip: Partial<SafetyTip>): Promise<SafetyTip> => {
    const res = await api.put(`/safety-tips/admin/${id}`, tip);
    return res.data;
  },

  deleteTipAdmin: async (id: number): Promise<void> => {
    await api.delete(`/safety-tips/admin/${id}`);
  }
};
