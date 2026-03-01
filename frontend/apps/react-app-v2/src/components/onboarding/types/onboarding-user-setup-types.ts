import * as z from "zod/v4-mini";
import { onboardingCompleteRegistrationFormSchema } from "../zod-validation/onboarding-complete-registration-form-schema";

export type OnboardingCompleteRegistrationFormType = z.infer<typeof onboardingCompleteRegistrationFormSchema>;
