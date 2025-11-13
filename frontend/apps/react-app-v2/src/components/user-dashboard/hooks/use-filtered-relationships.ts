import type { ValueOf } from "@/lib/types/types";
import { useRelationshipsArray } from "@/lib/valtio/queries/relationship-store-queries";
import type { RELATIONSHIP_STATUS } from "@/lib/zod-validation/relationship-schema";
import { useState } from "react";

export function useFilteredRelationships(status: ValueOf<typeof RELATIONSHIP_STATUS>) {
    const [filter, setFilter] = useState("");
    const relationship = useRelationshipsArray(status);

    return {
        filteredRelationships: filter.trim().length
            ? relationship.filter(
                  (r) =>
                      r.user.displayName.toLowerCase().includes(filter.toLowerCase()) ||
                      r.user.username.toLowerCase().includes(filter.toLowerCase()),
              )
            : relationship,
        filter,
        setFilter,
    };
}
