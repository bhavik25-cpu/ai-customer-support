import axios from 'axios';

const defaultApiUrl = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  timeout: 50000,
  withCredentials: true
});

export const getError = error =>
  error.response?.data?.message || error.message || 'Request failed. Please try again.';

export default api;
