import * as z from "zod/v4-mini";

export const tokensSchema = z.object({
    accesstoken: z.jwt(),
    refreshtoken: z.jwt(),
});
