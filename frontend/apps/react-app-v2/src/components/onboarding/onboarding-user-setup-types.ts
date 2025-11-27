import * as z from "zod/v4-mini";
import type { onboardingUserSerupFormSchema } from "./onboading-user-setup-form-schema";

export type OnboardingUserSeupFormType = z.infer<typeof onboardingUserSerupFormSchema>;
