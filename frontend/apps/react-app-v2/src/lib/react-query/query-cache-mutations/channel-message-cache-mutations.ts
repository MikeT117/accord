import type {
    APIChannelMessageType,
    APIChannelMessageUpdatedType,
    APIChannelMessageDeletedType,
} from "@/lib/types/types";
import type { InfiniteData } from "@tanstack/react-query";
import { queryClient } from "../query-client";
import { insertInfiniteDataItem, deleteInfiniteDataItem, updateInfiniteDataItem } from "../query-cache-utils";

export function handleChannelMessageCreated(payload: APIChannelMessageType) {
    queryClient.setQueryData<InfiniteData<APIChannelMessageType[]>>(
        ["channel", payload.channelId, "messages"],
        (prev) => insertInfiniteDataItem(prev, payload),
    );
}

export function handleChannelMessageUpdated(payload: APIChannelMessageUpdatedType) {
    queryClient.setQueryData<InfiniteData<APIChannelMessageType[]>>(
        ["channel", payload.channelId, "messages"],
        (prev) => updateInfiniteDataItem(prev, (m) => (m.id === payload.id ? { ...m, ...payload } : m)),
    );
}

export function handleChannelMessageDeleted(payload: APIChannelMessageDeletedType) {
    queryClient.setQueryData<InfiniteData<APIChannelMessageType[]>>(
        ["channel", payload.channelId, "messages"],
        (prev) => deleteInfiniteDataItem(prev, (msg) => msg.id !== payload.id),
    );
}
