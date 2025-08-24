import type { RelationshipType, APIRelationshipUpdatedType, APIRelationshipDeletedType } from "@/lib/types/types";
import { relationshipStore } from "../stores/relationship-store";

function resetRelationshipStore() {
    relationshipStore.keys = [];
    relationshipStore.values = {};
    relationshipStore.initialised = false;
}

export function handleRelationshipStoreInitialisation(relationships: RelationshipType[]) {
    if (relationshipStore.initialised) {
        resetRelationshipStore();
    }

    relationships.forEach((c) => {
        relationshipStore.keys.push(c.id);
        relationshipStore.values[c.id] = c;
    });
}

export function handleRelationshipCreated(relationship: RelationshipType) {
    relationshipStore.keys.push(relationship.id);
    relationshipStore.values[relationship.id] = relationship;
}

export function handlePrivateRelationshipUpdated(updatedRelationship: APIRelationshipUpdatedType) {
    const relationship = relationshipStore.values[updatedRelationship.id];
    if (!relationship) {
        return;
    }

    relationship.status = updatedRelationship.status;
    relationship.updatedAt = updatedRelationship.updatedAt;
}

export function handlePrivateRelationshipDeleted(relationship: APIRelationshipDeletedType) {
    const index = relationshipStore.keys.findIndex((c) => c === relationship.id);
    if (index === -1) {
        return;
    }

    relationshipStore.keys.splice(index, 1);
    delete relationshipStore.values[relationship.id];
}
