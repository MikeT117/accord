import type { ErrorComponentProps } from "@tanstack/react-router";
import { ServerNotFound } from "./server-not-found";
import { ChannelNotFound } from "./channel-not-found";
import { ChannelMessagesLoadingFailed } from "./channel-messages-loading-failed";

export function RootErrorComponent({ error }: ErrorComponentProps) {
    switch (error.name) {
        case "ErrServerNotFound":
            return <ServerNotFound />;
        case "ErrChannelNotFound":
            return <ChannelNotFound />;
        case "AxiosError":
            return <ChannelMessagesLoadingFailed />;
    }
}
