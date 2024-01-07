import axios from 'axios';
import { REST_API_ENDPOINT } from '@/constants';
import { useSessionStore, sessionStore } from '@/shared-stores/sessionStore';

export type AccordRESTAPIResponse = {
    status: number;
    successful: boolean;
};

export type AccordRESTAPIUnsuccessfulResponse = {
    detail?: string;
};

export type AccordRESTAPISuccessfulResponse<T = any> = AccordRESTAPIResponse & {
    data: T;
};

const api = axios.create({
    baseURL: REST_API_ENDPOINT,
});

api.interceptors.response.use((response) => {
    if (response.headers['authorization']) {
        sessionStore.setAccesstoken(response.headers['authorization']);
    }
    return response;
});

api.interceptors.request.use((config) => {
    if (config.url?.includes('cloudinary')) {
        return config;
    }

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
