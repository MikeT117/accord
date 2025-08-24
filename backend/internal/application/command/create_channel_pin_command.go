package command

import "github.com/google/uuid"

type CreateChannelPinCommand struct {
	ID          uuid.UUID
	ChannelID   uuid.UUID
	RequestorID uuid.UUID
}
