import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { AccordWebsocket } from "@/lib/websocket/websocket";
import { ThemeProvider } from "@/components/theme-provider";

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
    eventWebsocket: AccordWebsocket;
}>()({
    component: () => (
        <ThemeProvider>
            <Outlet />
        </ThemeProvider>
    ),
});
