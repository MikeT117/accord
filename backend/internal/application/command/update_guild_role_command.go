package command

import "github.com/google/uuid"

type UpdateGuildRoleCommand struct {
	ID          uuid.UUID
	Name        string
	GuildID     uuid.UUID
	Permissions int32
	RequestorID uuid.UUID
}
