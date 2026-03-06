import type { ErrorComponentProps } from "@tanstack/react-router";
import { GuildNotFound } from "./guild-not-found";
import { ChannelNotFound } from "./channel-not-found";
import { ChannelMessagesLoadingFailed } from "./channel-messages-loading-failed";
import { UnknownError } from "./unknown-error";

export function ErrorManager({ error }: ErrorComponentProps) {
    switch (error.name) {
        case "ErrGuildNotFound":
            return <GuildNotFound />;
        case "ErrChannelNotFound":
            return <ChannelNotFound />;
        case "AxiosError":
            return <ChannelMessagesLoadingFailed />;
        default:
            return <UnknownError />;
    }
}
