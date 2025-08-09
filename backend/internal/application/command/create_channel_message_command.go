package command

import "github.com/google/uuid"

type CreateChannelMessageCommand struct {
	Content       string
	AuthorID      uuid.UUID
	ChannelID     uuid.UUID
	AttachmentIDs []uuid.UUID
	RequestorID   uuid.UUID
}
