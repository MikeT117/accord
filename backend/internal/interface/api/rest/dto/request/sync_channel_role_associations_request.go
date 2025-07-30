package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type SyncChannelRoleAssociationsRequest struct {
	SourceChannelID string `param:"sourceChannelID"`
	TargetChannelID string `param:"targetChannelID"`
	GuildID         string `param:"guildID"`
}

func (r *SyncChannelRoleAssociationsRequest) ToSyncGuildRoleChannelAssociationsCommand(requestorID string) (*command.SyncGuildRoleChannelAssociationsCommand, error) {

	if strings.Trim(r.SourceChannelID, " ") == "" || strings.Trim(r.TargetChannelID, " ") == "" || strings.Trim(r.GuildID, " ") == "" {
		return nil, NewRequestValidationError("invalid channel id or guild id")
	}

	return &command.SyncGuildRoleChannelAssociationsCommand{
		SourceChannelID: r.SourceChannelID,
		TargetChannelID: r.TargetChannelID,
		GuildID:         r.GuildID,
		RequestorID:     requestorID,
	}, nil
}
