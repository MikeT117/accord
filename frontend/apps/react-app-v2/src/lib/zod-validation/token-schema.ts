import * as z from "zod/v4-mini";

export const tokensSchema = z.object({
    accesstoken: z._default(z.jwt(), ""),
    refreshtoken: z._default(z.jwt(), ""),
});
