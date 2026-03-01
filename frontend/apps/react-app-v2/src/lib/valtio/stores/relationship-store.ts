import type { Dictionary, RelationshipType } from "@/lib/types/types";
import { proxy } from "valtio";

type RelationshipStoreType = {
    initialised: boolean;
    keys: string[];
    values: Dictionary<RelationshipType>;
};

export const relationshipStore = proxy<RelationshipStoreType>({ initialised: false, keys: [], values: {} });
