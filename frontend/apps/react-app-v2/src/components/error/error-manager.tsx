import type { ErrorComponentProps } from "@tanstack/react-router";
import { GuildNotFound } from "./guild-not-found";
import { ChannelNotFound } from "./channel-not-found";
import { ChannelMessagesLoadingFailed } from "./channel-messages-loading-failed";

export function ErrorManager({ error }: ErrorComponentProps) {
    switch (error.name) {
        case "ErrGuildNotFound":
            return <GuildNotFound />;
        case "ErrChannelNotFound":
            return <ChannelNotFound />;
        case "AxiosError":
            return <ChannelMessagesLoadingFailed />;
    }
}
