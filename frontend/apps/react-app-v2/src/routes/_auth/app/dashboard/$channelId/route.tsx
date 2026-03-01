import { ErrChannelNotFound } from "@/lib/error";
import { doesPrivateChannelExist } from "@/lib/valtio/queries/private-channel-store-queries";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/app/dashboard/$channelId")({
    loader: ({ params: { channelId } }) => {
        if (!doesPrivateChannelExist(channelId)) {
            throw ErrChannelNotFound;
        }
    },
    component: Outlet,
});
