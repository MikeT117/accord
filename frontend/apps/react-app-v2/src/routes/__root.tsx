import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import {} from "@/lib/valtio/stores/theme-store";
import { AccordWebsocket } from "@/lib/websocket/websocket";

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
    eventWebsocket: AccordWebsocket;
}>()({
    component: Outlet,
});
