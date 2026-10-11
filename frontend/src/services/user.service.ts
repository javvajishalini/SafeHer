import api from './api';

export const userService = {
  getProfile: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },
  updateProfile: async (data: { fullName: string; phoneNumber: string }) => {
    const res = await api.put('/users/me', data);
    return res.data;
  },
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await api.post('/users/change-password', data);
    return res.data;
  },
  deleteAccount: async () => {
    const res = await api.delete('/users/me');
    return res.data;
  }
};
