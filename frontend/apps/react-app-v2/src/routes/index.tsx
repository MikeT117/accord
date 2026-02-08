import { createFileRoute, redirect } from "@tanstack/react-router";
import { tokenStore } from "@/lib/valtio/stores/token-store";
import { OnboardingProviderSelect } from "@/components/onboarding/onboarding-provider-select";
import { tokensSchema } from "@/lib/zod-validation/localstorage-schema";

export const Route = createFileRoute("/")({
    beforeLoad: () => {
        const { success } = tokensSchema.safeParse(tokenStore);
        if (success) throw redirect({ to: "/app" });
    },
    component: OnboardingProviderSelect,
});
