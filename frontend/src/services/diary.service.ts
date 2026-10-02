import axios from 'axios';

const API_URL = 'http://localhost:8080/api/diary';

export const diaryService = {
  createEntry: async (data: any) => {
    const response = await axios.post(API_URL, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },
  
  getEntries: async () => {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  deleteEntry: async (id: number) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }
};

export const aiService = {
  analyzeDiary: async () => {
    const response = await axios.post('http://localhost:8080/api/ai/analyze-diary', {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }
};
