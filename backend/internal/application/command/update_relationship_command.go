package command

import "github.com/google/uuid"

type UpdateRelationshipCommand struct {
	ID          uuid.UUID
	Status      int8
	RequestorID uuid.UUID
}
