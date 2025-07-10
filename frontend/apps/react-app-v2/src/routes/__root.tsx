import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import {} from "@/lib/valtio-stores/theme-store";

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
}>()({
    component: () => <Outlet />,
});
