package command

import "github.com/google/uuid"

type DeleteChannelPinCommand struct {
	ID          uuid.UUID
	ChannelID   uuid.UUID
	RequestorID uuid.UUID
}
