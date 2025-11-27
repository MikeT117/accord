import { AuthOnboardingUserSetup } from "@/components/onboarding/onboarding-user-setup";
import { createFileRoute } from "@tanstack/react-router";

type OnboardingUserSetupSearchParamsType = {
    token: string;
};

export const Route = createFileRoute("/onboarding")({
    validateSearch: (params: Record<string, unknown>): OnboardingUserSetupSearchParamsType => {
        return {
            token: (params?.token as string) ?? "",
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { token } = Route.useSearch();
    return <AuthOnboardingUserSetup token={token} />;
}
