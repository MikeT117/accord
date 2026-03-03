import type { ValueOf } from "@/lib/types/types";
import type { RELATIONSHIP_STATUS } from "@/lib/zod-validation/relationship-schema";
import { useRelationships } from "@/lib/zustand/stores/relationship-store";
import { useState } from "react";

export function useFilteredRelationships(status: ValueOf<typeof RELATIONSHIP_STATUS>) {
    const [filter, setFilter] = useState("");
    const relationships = useRelationships(status);

    return {
        filteredRelationships: filter.trim().length
            ? relationships.filter(
                  (r) =>
                      r.user.displayName.toLowerCase().includes(filter.toLowerCase()) ||
                      r.user.username.toLowerCase().includes(filter.toLowerCase()),
              )
            : relationships,
        filter,
        setFilter,
    };
}
