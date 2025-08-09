package command

import "github.com/google/uuid"

type DeleteSessionCommand struct {
	ID          uuid.UUID
	RequestorID uuid.UUID
}
