package command

import "github.com/google/uuid"

type DeleteRelationshipCommand struct {
	ID          uuid.UUID
	RequestorID uuid.UUID
}
