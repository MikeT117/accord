package command

import "github.com/google/uuid"

type DeleteChannelCommand struct {
	ID          uuid.UUID
	RequestorID uuid.UUID
}
