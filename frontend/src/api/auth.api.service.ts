import axios from 'axios';

import { API_URL } from '../configs/api.config';

const AUTH_API_URL = API_URL + '/auth';
export const AUTH_ENTRAID_URL = '/sso/entraId';

export const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
