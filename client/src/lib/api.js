import axios from 'axios';

const defaultApiUrl = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  timeout: 50000
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('support_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

export const getError = error =>
  error.response?.data?.message || error.message || 'Request failed. Please try again.';

export default api;
