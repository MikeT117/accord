import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";
import {
    APIRelationshipDeletedType,
    APIRelationshipUpdatedType,
    Normalize,
    RelationshipType,
    ValueOf,
} from "@/lib/types/types";
import { RELATIONSHIP_STATUS } from "@/lib/zod-validation/relationship-schema";
import { APP_MODE, env } from "@/lib/constants";

type RelationshipStoreType = Normalize<RelationshipType> & { initialised: boolean };

type RelationshipActions = {
    initialise: (relationships: RelationshipType[]) => void;
    createRelationship: (relationship: RelationshipType) => void;
    updateRelationship: (updatedRelationship: APIRelationshipUpdatedType) => void;
    deleteRelationship: (deletedRelationship: APIRelationshipDeletedType) => void;
};

const initialState: RelationshipStoreType = { initialised: false, keys: [], values: {} };
type RelationshipStore = RelationshipStoreType & RelationshipActions;

export const useRelationshipStore = create<RelationshipStore>()(
    devtools(
        immer((set) => ({
            ...initialState,
            initialise: (relationships) => {
                return set((state) => {
                    const keys = [];
                    const values: { [key: string]: RelationshipType } = {};

                    for (const relationship of relationships) {
                        keys.push(relationship.id);
                        values[relationship.id] = relationship;
                    }

                    state.keys = keys;
                    state.values = values;
                    state.initialised = true;
                });
            },
            createRelationship: (relationship) => {
                return set((state) => {
                    state.keys.push(relationship.id);
                    state.values[relationship.id] = relationship;
                });
            },
            updateRelationship: (updatedRelationship) => {
                return set((state) => {
                    let relationship = state.values[updatedRelationship.id];
                    if (!relationship) {
                        return;
                    }

                    relationship.status = updatedRelationship.status;
                    relationship.updatedAt = updatedRelationship.updatedAt;
                });
            },
            deleteRelationship: (deletedRelationship) => {
                return set((state) => {
                    const index = state.keys.findIndex((c) => c === deletedRelationship.id);
                    if (index !== -1) {
                        state.keys.splice(index, 1);
                    }

                    delete state.values[deletedRelationship.id];
                });
            },
        })),
        { name: "relationshipStore", enabled: env.APP_MODE === APP_MODE.DEVELOPMENT },
    ),
);

export const useRelationships = (status: ValueOf<typeof RELATIONSHIP_STATUS>) => {
    return useRelationshipStore(
        useShallow((s) => {
            const relationships = [];
            for (const key of s.keys) {
                const relationship = s.values[key];
                if (!relationship) {
                    continue;
                }

                if (relationship.status !== status) {
                    continue;
                }

                relationships.push(relationship);
            }

            return relationships;
        }),
    );
};

export const relationshipStoreActions = {
    initialise: useRelationshipStore.getState().initialise,
    createRelationship: useRelationshipStore.getState().createRelationship,
    updateRelationship: useRelationshipStore.getState().updateRelationship,
    deleteRelationship: useRelationshipStore.getState().deleteRelationship,
};
