package command

import "github.com/google/uuid"

type DeleteGuildInviteCommand struct {
	ID          uuid.UUID
	GuildID     uuid.UUID
	RequestorID uuid.UUID
}
