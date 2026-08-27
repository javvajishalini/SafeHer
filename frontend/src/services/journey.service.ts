import api from './api';

export interface Location {
    address: string;
    latitude?: number;
    longitude?: number;
}

export enum JourneyStatus {
    PLANNED = 'PLANNED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface Journey {
    id: string;
    title: string;
    startLocation: Location;
    destination: Location;
    journeyDate: string; // ISO format YYYY-MM-DD
    plannedStartTime: string; // HH:mm:ss
    expectedArrivalTime: string; // HH:mm:ss
    description?: string;
    status: JourneyStatus;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
}

export interface CreateJourneyRequest {
    title: string;
    startLocation: Location;
    destination: Location;
    journeyDate: string;
    plannedStartTime: string;
    expectedArrivalTime: string;
    description?: string;
}

export const journeyService = {
    createJourney: async (data: CreateJourneyRequest): Promise<Journey> => {
        const response = await api.post('/journeys', data);
        return response.data;
    },

    getJourneys: async (): Promise<Journey[]> => {
        const response = await api.get('/journeys');
        return response.data;
    },

    getJourneyById: async (id: string): Promise<Journey> => {
        const response = await api.get(`/journeys/${id}`);
        return response.data;
    },

    updateJourney: async (id: string, data: CreateJourneyRequest): Promise<Journey> => {
        const response = await api.put(`/journeys/${id}`, data);
        return response.data;
    },

    startJourney: async (id: string): Promise<Journey> => {
        const response = await api.patch(`/journeys/${id}/start`);
        return response.data;
    },

    completeJourney: async (id: string): Promise<Journey> => {
        const response = await api.patch(`/journeys/${id}/complete`);
        return response.data;
    },

    cancelJourney: async (id: string): Promise<Journey> => {
        const response = await api.patch(`/journeys/${id}/cancel`);
        return response.data;
    }
};
