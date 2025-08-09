package command

import "github.com/google/uuid"

type DeleteGuildBanCommand struct {
	UserID      uuid.UUID
	GuildID     uuid.UUID
	RequestorID uuid.UUID
}
