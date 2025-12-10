import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const wardService = {
    getAll: () => api.get('/wards'),
    create: (data: any) => api.post('/wards', data),
};

export const bedService = {
    getAll: (wardId?: number) => api.get('/beds', { params: { wardId } }),
    updateStatus: (id: number, status: string) => api.patch(`/beds/${id}/status`, { status }),
};

export const patientService = {
    getAll: () => api.get('/patients'),
    create: (data: any) => api.post('/patients', data),
};

export const bookingService = {
    getAll: () => api.get('/bookings'),
    create: (data: any) => api.post('/bookings', data),
};

export default api;
