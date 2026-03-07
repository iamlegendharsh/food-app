import axios from 'axios';

const API_URL = 'https://food-app-4-e91k.onrender.com';

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
