import { envSchema } from "./zod-validation/env-schema";

export const env = (() => {
    return envSchema.parse((window as any).__ENV__);
})();
