import * as z from "zod/v4-mini";

export const envSchema = z.object({
    HOST: z.url(),
    CLOUDINARY_URL: z.url(),
    CLOUDINARY_RES_URL: z.url(),
    CLOUDINARY_API_KEY: z.string(),
    API_URL: z.url(),
    RTC_URL: z.url(),
    WS_URL: z.url(),
});
