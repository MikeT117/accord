import * as z from "zod/v4-mini";

const appModeSchema = z.literal(["DEVELOPMENT", "PRODUCTION"]);

export const envSchema = z.object({
    HOST: z.string(),
    CLOUDINARY_URL: z.url(),
    CLOUDINARY_RES_URL: z.url(),
    CLOUDINARY_API_KEY: z.string(),
    API_URL: z.string(),
    RTC_URL: z.string(),
    WS_URL: z.string(),
    APP_MODE: appModeSchema,
});
