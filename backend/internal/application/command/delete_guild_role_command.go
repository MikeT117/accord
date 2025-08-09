package command

import "github.com/google/uuid"

type DeleteGuildRoleCommand struct {
	ID          uuid.UUID
	GuildID     uuid.UUID
	RequestorID uuid.UUID
}
