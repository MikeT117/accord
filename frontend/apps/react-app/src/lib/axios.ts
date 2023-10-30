import axios from 'axios';
import { REST_API_ENDPOINT } from '@/constants';
import { useSessionStore, sessionStore } from '@/shared-stores/sessionStore';

export type APIResponse<T = any> = {
  status: number;
  successful: boolean;
  data: T;
};

const api = axios.create({
  baseURL: REST_API_ENDPOINT,
});

api.interceptors.response.use((response) => {
  if (response.headers['Authorization']) {
    sessionStore.setAccesstoken(response.headers['Authorization']);
  }
  return response.data;
});

api.interceptors.request.use((config) => {
  if (config.headers) {
    config.headers['Authorization'] = useSessionStore.getState().accesstoken;
    config.headers['X-App-Token'] = useSessionStore.getState().refreshtoken;
  }
  return config;
});

api.defaults.validateStatus = (status) => {
  return status < 400;
};

export { api };
