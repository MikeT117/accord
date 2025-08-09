package command

import "github.com/google/uuid"

type CreateRelationshipCommand struct {
	CreatorID   uuid.UUID
	RecipientID uuid.UUID
	Status      int8
}
