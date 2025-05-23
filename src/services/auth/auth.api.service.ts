import axios from 'axios';
import { API_URL } from '../api.service'

const AUTH_API_URL = API_URL + '/auth'

export const authApi = axios.create({
    baseURL: AUTH_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


