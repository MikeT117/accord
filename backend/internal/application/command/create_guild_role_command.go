package command

import "github.com/google/uuid"

type CreateGuildRoleCommand struct {
	GuildID     uuid.UUID
	RequestorID uuid.UUID
}
