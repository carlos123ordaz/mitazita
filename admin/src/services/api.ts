import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api';

export const api = axios.create({ baseURL: BASE_URL });

export function authHeaders(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}
