import api from './api';

export const contactService = {
  getAll: async () => {
    const response = await api.get('/contacts');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/contacts', data);
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },
  toggleStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/contacts/${id}/status`, { isActive });
    return response.data;
  }
};
