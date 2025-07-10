import type z from "zod";
import type { envSchema } from "../zod-validation/env-schema";

export type EnvironmentVarsType = z.infer<typeof envSchema>;
