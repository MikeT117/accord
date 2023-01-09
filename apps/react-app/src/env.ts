const { CLOUDINARY_URL, CLOUDINARY_API_KEY, API_URL, RTC_URL, WS_URL, ENVIRONMENT } = (
  window as any
).__ENV__;

export const env: Environment = {
  apiUrl: import.meta.env.PROD ? API_URL : import.meta.env.VITE_API_URL,
  cloudinaryApiKey: import.meta.env.PROD
    ? CLOUDINARY_API_KEY
    : import.meta.env.VITE_CLOUDINARY_API_KEY,
  cloudinaryUrl: import.meta.env.PROD ? CLOUDINARY_URL : import.meta.env.VITE_CLOUDINARY_URL,
  rtcUrl: import.meta.env.PROD ? RTC_URL : import.meta.env.VITE_RTC_URL,
  wsUrl: import.meta.env.PROD ? WS_URL : import.meta.env.VITE_WS_URL,
  env: ENVIRONMENT,
};

type Environment = {
  apiUrl: string;
  rtcUrl: string;
  wsUrl: string;
  cloudinaryApiKey: string;
  cloudinaryUrl: string;
  env: string;
};
