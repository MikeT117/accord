package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type SyncChannelRoleAssociationsRequest struct {
	SourceChannelID uuid.UUID `param:"sourceChannelID"`
	TargetChannelID uuid.UUID `param:"targetChannelID"`
	GuildID         uuid.UUID `param:"guildID"`
}

func (r *SyncChannelRoleAssociationsRequest) ToSyncGuildRoleChannelAssociationsCommand(requestorID uuid.UUID) (*command.SyncGuildRoleChannelAssociationsCommand, error) {
	return &command.SyncGuildRoleChannelAssociationsCommand{
		SourceChannelID: r.SourceChannelID,
		TargetChannelID: r.TargetChannelID,
		GuildID:         r.GuildID,
		RequestorID:     requestorID,
	}, nil
}
