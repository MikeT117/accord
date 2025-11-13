import { useSnapshot } from "valtio";
import { relationshipStore } from "../stores/relationship-store";
import type { ValueOf } from "@/lib/types/types";
import { RELATIONSHIP_STATUS } from "@/lib/zod-validation/relationship-schema";

export function useRelationshipsArray(status: ValueOf<typeof RELATIONSHIP_STATUS>) {
    const relationshipStoreSnapshot = useSnapshot(relationshipStore);
    return relationshipStoreSnapshot.keys
        .map((k) => relationshipStoreSnapshot.values[k]!)
        .filter((r) => r.status === status);
}
