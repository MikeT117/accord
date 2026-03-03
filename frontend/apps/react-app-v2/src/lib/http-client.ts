import axios, { AxiosError } from "axios";
import { env } from "./constants";
import type { APIErrorResponse } from "@/lib/types/types";
import { tokenStoreActions, tokenStoreState } from "./zustand/stores/token-store";

const httpClient = axios.create({
    baseURL: `${env.HOST}/api/v1`,
    adapter: "fetch",
});

httpClient.interceptors.request.use((config) => {
    if (config.url?.includes("cloudinary")) {
        return config;
    }

    config.headers.setAuthorization(tokenStoreState().accesstoken);
    config.headers.set("X-App-Token", tokenStoreState().refreshtoken);

    return config;
});

httpClient.defaults.validateStatus = (status) => {
    return status < 400;
};

httpClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<APIErrorResponse>) => {
        console.error(error.response);
        if (error.response?.status === 401 && error.response?.data?.detail === "invalid tokens") {
            tokenStoreActions.reset();
        }

        throw error;
    },
);

export { httpClient };
