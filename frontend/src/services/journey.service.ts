import api from './api';

export interface Location {
    address: string;
    latitude?: number;
    longitude?: number;
}

export enum JourneyStatus {
    PLANNED = 'PLANNED',
    ACTIVE = 'ACTIVE',
    OVERDUE = 'OVERDUE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface ContactSummary {
    id: number;
    name: string;
    phoneNumber?: string;
    email?: string;
}

export interface Journey {
    id: number;
    title: string;
    startLocation: Location;
    destination: Location;
    journeyDate: string; // ISO format YYYY-MM-DD
    plannedStartTime: string; // HH:mm:ss
    expectedArrivalTime: string; // HH:mm:ss
    description?: string;
    status: JourneyStatus;
    safetyBufferMinutes?: number;
    expectedArrivalAt?: string; // Instant ISO string
    lastLatitude?: number;
    lastLongitude?: number;
    lastLocationUpdate?: string;
    lastLocationUrl?: string;
    emergencyContacts?: ContactSummary[];
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
    safetyBufferMinutes?: number;
    emergencyContactIds?: number[];
    expectedDurationMinutes?: number;
}

export interface StartJourneyPayload {
    latitude?: number;
    longitude?: number;
    expectedDurationMinutes?: number;
}

export interface LocationUpdatePayload {
    latitude: number;
    longitude: number;
    accuracy?: number;
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

    getActiveJourney: async (): Promise<Journey | null> => {
        try {
            const response = await api.get('/journeys/active');
            if (response.status === 204 || !response.data) return null;
            return response.data;
        } catch (e) {
            return null;
        }
    },

    getJourneyById: async (id: number): Promise<Journey> => {
        const response = await api.get(`/journeys/${id}`);
        return response.data;
    },

    updateJourney: async (id: number, data: CreateJourneyRequest): Promise<Journey> => {
        const response = await api.put(`/journeys/${id}`, data);
        return response.data;
    },

    startJourney: async (id: number, payload?: StartJourneyPayload): Promise<Journey> => {
        const response = await api.post(`/journeys/${id}/start`, payload || {});
        return response.data;
    },

    updateLocation: async (id: number, payload: LocationUpdatePayload): Promise<Journey> => {
        const response = await api.post(`/journeys/${id}/location`, payload);
        return response.data;
    },

    completeJourney: async (id: number, sendSafeArrival: boolean = true): Promise<Journey> => {
        const response = await api.post(`/journeys/${id}/complete`, { sendSafeArrival });
        return response.data;
    },

    cancelJourney: async (id: number): Promise<Journey> => {
        const response = await api.post(`/journeys/${id}/cancel`);
        return response.data;
    }
};
