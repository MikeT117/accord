import axios from 'axios';
import { REST_API_ENDPOINT } from '@/constants';
import { useSessionStore, sessionStore } from '@/shared-stores/sessionStore';

const api = axios.create({
  baseURL: REST_API_ENDPOINT,
});

api.interceptors.response.use((response) => {
  if (response.headers['access-token']) {
    sessionStore.setAccesstoken(response.headers['access-token']);
  }
  return response;
});

api.interceptors.request.use((config) => {
  if (config.headers) {
    config.headers['access-token'] = useSessionStore.getState().accesstoken;
    config.headers['refresh-token'] = useSessionStore.getState().refreshtoken;
  }
  return config;
});

api.defaults.validateStatus = (status) => {
  return status !== 500;
};

export { api };
