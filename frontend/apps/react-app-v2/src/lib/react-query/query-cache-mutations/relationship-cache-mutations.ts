import type { APIRelationshipType, APIRelationshipUpdatedType, APIRelationshipDeletedType } from "@/lib/types/types";
import type { InfiniteData } from "@tanstack/react-query";
import { queryClient } from "../query-client";
import { insertInfiniteDataItem, deleteInfiniteDataItem, updateInfiniteDataItem } from "../query-cache-utils";

export function handleRelationshipCreated(payload: APIRelationshipType) {
    queryClient.setQueryData<InfiniteData<APIRelationshipType[]>>(["relationships", payload.status], (prev) =>
        insertInfiniteDataItem(prev, payload)
    );
}

export function handleRelationshipUpdated(payload: APIRelationshipUpdatedType) {
    queryClient.setQueryData<InfiniteData<APIRelationshipType[]>>(["relationships", payload.status], (prev) =>
        updateInfiniteDataItem(prev, (r) => (r.id === payload.id ? { ...r, ...payload } : r))
    );
}

export function handleRelationshipDeleted(payload: APIRelationshipDeletedType) {
    queryClient.setQueryData<InfiniteData<APIRelationshipType[]>>(["relationships"], (prev) =>
        deleteInfiniteDataItem(prev, (rel) => rel.id !== payload.id)
    );
}
