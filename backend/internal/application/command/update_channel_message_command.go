package command

import "github.com/google/uuid"

type UpdateChannelMessageCommand struct {
	ID          uuid.UUID
	Content     string
	ChannelID   uuid.UUID
	RequestorID uuid.UUID
}
