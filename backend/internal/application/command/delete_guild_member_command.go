package command

import "github.com/google/uuid"

type DeleteGuildMemberCommand struct {
	UserID      uuid.UUID
	GuildID     uuid.UUID
	RequestorID uuid.UUID
}
