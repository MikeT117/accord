package command

import "github.com/google/uuid"

type CreateGuildBanCommand struct {
	UserID      uuid.UUID
	GuildID     uuid.UUID
	Reason      string
	RequestorID uuid.UUID
}
