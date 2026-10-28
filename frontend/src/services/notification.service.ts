import api from './api';

export interface NotificationRecord {
  id: number;
  userId: number;
  type: 'SMS' | 'EMAIL' | 'PUSH';
  title?: string;
  message?: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  recipient?: string;
  provider?: string;
  errorMessage?: string;
  relatedSosId?: number;
  relatedJourneyId?: number;
  relatedContactId?: number;
  createdAt: string;
  sentAt?: string;
}

export const notificationService = {
  getUserNotifications: async (): Promise<NotificationRecord[]> => {
    const response = await api.get<NotificationRecord[]>('/notifications');
    return response.data;
  },

  getSOSNotifications: async (sosId: number): Promise<NotificationRecord[]> => {
    const response = await api.get<NotificationRecord[]>(`/notifications/sos/${sosId}`);
    return response.data;
  },

  getJourneyNotifications: async (journeyId: number): Promise<NotificationRecord[]> => {
    const response = await api.get<NotificationRecord[]>(`/notifications/journey/${journeyId}`);
    return response.data;
  }
};
