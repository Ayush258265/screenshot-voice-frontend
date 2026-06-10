import axios from 'axios';

// Automatically detect environment
const getBaseUrl = () => {
    // Production (when deployed to Vercel)
    if (process.env.NODE_ENV === 'production') {
        return 'https://your-backend-url.onrender.com/api';  // Update after deployment
    }
    // Local development
    return 'http://localhost:8080/api';
};

const API = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

let currentUserId = null;

export const setUserId = (id) => {
    currentUserId = id;
};

export const getUserId = () => currentUserId;

export const register = (userData) => API.post('/auth/register', userData);
export const login = (userData) => API.post('/auth/login', userData);

export const uploadScreenshot = (userId, formData) =>
    API.post(`/screenshots/upload/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const getUserScreenshots = (userId) =>
    API.get(`/screenshots/user/${userId}`);

export const deleteScreenshot = (userId, screenshotId) =>
    API.delete(`/screenshots/${screenshotId}/user/${userId}`);

export const addVoiceToScreenshot = (userId, screenshotId, formData) =>
    API.post(`/voice/${screenshotId}/user/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// In src/services/api.js, update getVoiceUrl function:

export const getVoiceUrl = (userId, screenshotId) => {
    // For local development
    return `http://localhost:8080/api/voice/${screenshotId}/play/user/${userId}`;
};

export const deleteVoice = (userId, screenshotId) =>
    API.delete(`/voice/${screenshotId}/user/${userId}`);

export default API;