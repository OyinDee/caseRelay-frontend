import axios from 'axios';

const BASE_URL = 'https://cr-bybsg3akhphkf3b6.canadacentral-01.azurewebsites.net/api';

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
