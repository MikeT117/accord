package command

import "github.com/google/uuid"

type CreateRelationshipCommand struct {
	CreatorID uuid.UUID
	Username  string
	Status    int8
}
