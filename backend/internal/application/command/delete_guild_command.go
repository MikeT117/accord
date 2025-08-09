package command

import "github.com/google/uuid"

type DeleteGuildCommand struct {
	ID          uuid.UUID
	RequestorID uuid.UUID
}
