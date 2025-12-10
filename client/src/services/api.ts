import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const wardService = {
    getAll: () => api.get('/wards'),
    create: (data: any) => api.post('/wards', data),
    delete: (id: number) => api.delete(`/wards/${id}`),
    autoAdmit: (id: number, data: any) => api.post(`/wards/${id}/auto-admit`, data),
};

export const bedService = {
    getAll: (wardId: number) => api.get(`/beds/${wardId}`),
    updateStatus: (id: number, status: string, userName?: string) => api.patch(`/beds/${id}/status`, { status, userName }),
};

export const patientService = {
    getAll: (search?: string) => api.get('/patients', { params: { search } }),
    create: (data: any, userName?: string) => api.post('/patients', { ...data, userName }),
    discharge: (id: number, userName?: string) => api.post(`/patients/${id}/discharge`, { userName }),
    updateCondition: (id: number, condition: string, userName?: string) => api.patch(`/patients/${id}/condition`, { condition, userName }),
    transfer: (id: number, targetBedId: number, userName?: string) => api.post(`/patients/${id}/transfer`, { targetBedId, userName }),
};

export const bookingService = {
    getAll: () => api.get('/bookings'),
    create: (data: any) => api.post('/bookings', data),
};

export const statsService = {
    get: () => api.get('/stats'),
};

export const simulationService = {
    run: () => api.post('/simulation/run'),
};

export const activityService = {
    get: () => api.get('/activity'),
};

export default api;
