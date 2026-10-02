import axios from 'axios';

const API_URL = 'http://localhost:8080/api/sos';

export const sosService = {
  activateSOS: async (data: { latitude?: number; longitude?: number; accuracy?: number; address?: string; message?: string }) => {
    const response = await axios.post(API_URL, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await axios.get(`${API_URL}/history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  getActiveSOS: async () => {
    const history = await sosService.getHistory();
    return history.find((incident: any) => incident.status === 'ACTIVE');
  },

  resolveSOS: async (id: number) => {
    const response = await axios.patch(`${API_URL}/${id}/resolve`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  cancelSOS: async (id: number) => {
    const response = await axios.patch(`${API_URL}/${id}/cancel`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
};
