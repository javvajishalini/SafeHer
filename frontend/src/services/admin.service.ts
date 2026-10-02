import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin';

export const adminService = {
  getDashboardStats: async () => {
    const response = await axios.get(`${API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }
};
