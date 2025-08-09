package command

import "github.com/google/uuid"

type DeleteChannelMessageCommand struct {
	ID          uuid.UUID
	ChannelID   uuid.UUID
	RequestorID uuid.UUID
}
