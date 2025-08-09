package command

import "github.com/google/uuid"

type DeleteVoiceStateCommand struct {
	ID          uuid.UUID
	RequestorID uuid.UUID
}
