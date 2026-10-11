import api from './api';

export interface AIAssistantMessage {
  id?: number;
  sender: 'USER' | 'AI' | 'SYSTEM';
  message: string;
  timestamp?: string;
}

export interface AIChatResponse {
  conversationId: string;
  response: string;
  timestamp: string;
}

export interface AIAnalysisResult {
  id?: number;
  summary: string;
  patterns: string[];
  recommendations: string[];
  disclaimer: string;
  createdAt?: string;
}

export const aiService = {
  chat: async (message: string, conversationId?: string): Promise<AIChatResponse> => {
    const res = await api.post('/ai/chat', { message, conversationId });
    return res.data;
  },

  getConversations: async (): Promise<any[]> => {
    const res = await api.get('/ai/chat/conversations');
    return res.data;
  },

  analyzeDiary: async (): Promise<AIAnalysisResult> => {
    const res = await api.post('/ai/analyze-diary');
    return res.data;
  }
};
