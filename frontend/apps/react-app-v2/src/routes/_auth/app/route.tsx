import { tokensSchema } from "@/lib/zod-validation/token-schema";
import { tokenStore } from "@/lib/valtio-stores/token-store";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/app")({
    beforeLoad: () => {
        const { success } = tokensSchema.safeParse(tokenStore);
        if (!success) {
            throw redirect({ to: "/" });
        }
    },
    component: RouteComponent,
});

function RouteComponent() {
    return <Outlet />;
}
