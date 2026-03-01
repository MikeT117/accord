import { tokenStore } from "@/lib/valtio/stores/token-store";
import axios, { AxiosError } from "axios";
import { env } from "./constants";
import type { APIErrorResponse } from "./types/types";
import { handleResetTokenStore } from "./valtio/mutations/token-store-mutations";

const httpClient = axios.create({
    baseURL: `${env.HOST}/api/v1`,
    adapter: "fetch",
});

httpClient.interceptors.request.use((config) => {
    if (config.url?.includes("cloudinary")) {
        return config;
    }

    config.headers.setAuthorization(tokenStore.accesstoken);
    config.headers.set("X-App-Token", tokenStore.refreshtoken);

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
            handleResetTokenStore();
        }

        throw error;
    },
);

export { httpClient };
