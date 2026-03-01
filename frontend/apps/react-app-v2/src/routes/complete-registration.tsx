import { OnboardingCompleteRegistration } from "@/components/onboarding/onboarding-complete-registration";
import { createFileRoute } from "@tanstack/react-router";

type OnboardingUserSetupSearchParamsType = {
    token: string;
};

export const Route = createFileRoute("/complete-registration")({
    validateSearch: (params: Record<string, unknown>): OnboardingUserSetupSearchParamsType => {
        return {
            token: (params?.token as string) ?? "",
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { token } = Route.useSearch();
    return <OnboardingCompleteRegistration token={token} />;
}
