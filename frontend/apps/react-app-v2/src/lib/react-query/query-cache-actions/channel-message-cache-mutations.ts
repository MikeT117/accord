import type {
    APIChannelMessageType,
    APIChannelMessageUpdatedType,
    APIChannelMessageDeletedType,
} from "@/lib/types/types";
import type { InfiniteData } from "@tanstack/react-query";
import { queryClient } from "../query-client";
import { insertInfiniteDataItem, deleteInfiniteDataItem, updateInfiniteDataItem } from "../query-cache-utils";

function createChannelMessage(payload: APIChannelMessageType) {
    queryClient.setQueryData<InfiniteData<APIChannelMessageType[]>>(
        ["channel", payload.channelId, "messages"],
        (prev) => insertInfiniteDataItem(prev, payload),
    );
}

function updateChannelMessage(payload: APIChannelMessageUpdatedType) {
    queryClient.setQueryData<InfiniteData<APIChannelMessageType[]>>(
        ["channel", payload.channelId, "messages"],
        (prev) => updateInfiniteDataItem(prev, (m) => (m.id === payload.id ? { ...m, ...payload } : m)),
    );
}

function deleteChannelMessage(payload: APIChannelMessageDeletedType) {
    queryClient.setQueryData<InfiniteData<APIChannelMessageType[]>>(
        ["channel", payload.channelId, "messages"],
        (prev) => deleteInfiniteDataItem(prev, (msg) => msg.id !== payload.id),
    );
}

export const queryCacheActions = {
    createChannelMessage,
    updateChannelMessage,
    deleteChannelMessage,
};
