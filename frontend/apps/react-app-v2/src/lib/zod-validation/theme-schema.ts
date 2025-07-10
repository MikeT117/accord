import * as z from "zod/v4-mini";

export const themeSchema = z.object({
    theme: z._default(z.enum(["dark", "system", "light"]), "system"),
});
