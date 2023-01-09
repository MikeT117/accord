import axios from 'axios';
import { REST_API_ENDPOINT } from '@/constants';
import { useSessionStore, sessionStoreActions } from '@/shared-stores/sessionStore';

const api = axios.create({
  baseURL: REST_API_ENDPOINT,
});

api.interceptors.response.use((response) => {
  if (response.headers['access-token']) {
    sessionStoreActions.setAccesstoken(response.headers['access-token']);
  }
  return response;
});

api.interceptors.request.use((config) => {
  if (config.headers) {
    // @ts-expect-error Fixed in: https://github.com/axios/axios/pull/5420
    config.headers['access-token'] = useSessionStore.getState().accesstoken;
    // @ts-expect-error Fixed in: https://github.com/axios/axios/pull/5420
    config.headers['refresh-token'] = useSessionStore.getState().refreshtoken;
  }
  return config;
});

api.defaults.validateStatus = (status) => {
  return status !== 500;
};

export { api };
