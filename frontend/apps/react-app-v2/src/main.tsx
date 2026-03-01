import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { queryClient } from "./lib/react-query/query-client";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";
import { eventWebsocket } from "./lib/websocket/event-ws";

const router = createRouter({
    routeTree,
    context: {
        queryClient,
        eventWebsocket,
    },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <RouterProvider router={router} />
                </TooltipProvider>
            </QueryClientProvider>
        </StrictMode>,
    );
}
