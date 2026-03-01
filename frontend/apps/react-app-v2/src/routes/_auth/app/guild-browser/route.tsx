import { RootErrorComponent } from "@/components/error/error-component";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/app/guild-browser")({
    errorComponent: (errProps) => <RootErrorComponent {...errProps} />,
    component: Outlet,
});
