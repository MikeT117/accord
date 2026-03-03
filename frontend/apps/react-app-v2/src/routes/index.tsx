import { createFileRoute, redirect } from "@tanstack/react-router";
import { OnboardingSocialProviderSelect } from "@/components/onboarding/onboarding-social-provider-select";
import { tokensSchema } from "@/lib/zod-validation/localstorage-schema";
import { tokenStoreState } from "@/lib/zustand/stores/token-store";

export const Route = createFileRoute("/")({
    beforeLoad: () => {
        const { success } = tokensSchema.safeParse(tokenStoreState);
        if (success) {
            throw redirect({ to: "/app" });
        }
    },
    component: OnboardingSocialProviderSelect,
});
