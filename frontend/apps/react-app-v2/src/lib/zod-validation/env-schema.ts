import * as z from "zod/v4-mini";

const appModeSchema = z.literal(["DEVELOPMENT", "PRODUCTION"]);
const protocolSchema = z.literal(["http", "https"]);

export const envSchema = z.object({
    PROTOCOL: protocolSchema,
    CLOUDINARY_URL: z.optional(z.nullable(z.string())),
    CLOUDINARY_RES_URL: z.optional(z.nullable(z.string())),
    CLOUDINARY_API_KEY: z.optional(z.nullable(z.string())),
    API_URL: z.string(),
    RTC_URL: z.string(),
    WS_URL: z.string(),
    APP_MODE: appModeSchema,
});
