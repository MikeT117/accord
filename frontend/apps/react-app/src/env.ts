const {
    HOST,
    CLOUDINARY_URL,
    CLOUDINARY_API_KEY,
    API_URL,
    RTC_URL,
    WS_URL,
    ENVIRONMENT,
    CLOUDINARY_RES_URL,
} = (window as any).__ENV__;

export const env: Environment = {
    host: HOST,
    apiUrl: API_URL,
    cloudinaryApiKey: CLOUDINARY_API_KEY,
    cloudinaryUrl: CLOUDINARY_URL,
    cloudinaryResUrl: CLOUDINARY_RES_URL,
    rtcUrl: RTC_URL,
    wsUrl: WS_URL,
    env: ENVIRONMENT,
};

type Environment = {
    host: string;
    apiUrl: string;
    rtcUrl: string;
    wsUrl: string;
    cloudinaryApiKey: string;
    cloudinaryUrl: string;
    cloudinaryResUrl: string;
    env: string;
};
