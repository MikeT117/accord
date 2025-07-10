import { tokenStore } from "@/lib/valtio-stores/token-store";
import axios from "axios";
import { env } from "./constants";

export const api = axios.create({
    baseURL: `${env.HOST}/api/v1`,
    adapter: "fetch",
});

api.interceptors.request.use((config) => {
    config.headers.setAuthorization(tokenStore.accesstoken);
    config.headers.set("X-App-Token", tokenStore.refreshtoken);
    return config;
});
