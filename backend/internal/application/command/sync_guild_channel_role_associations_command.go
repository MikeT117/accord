package command

import "github.com/google/uuid"

type SyncGuildRoleChannelAssociationsCommand struct {
	SourceChannelID uuid.UUID
	TargetChannelID uuid.UUID
	GuildID         uuid.UUID
	RequestorID     uuid.UUID
}
