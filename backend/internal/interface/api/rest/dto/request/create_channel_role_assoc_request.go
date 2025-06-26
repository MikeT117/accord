package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type CreateGuildRoleChannelAssocRequest struct {
	RoleID    string `param:"roleID"`
	ChannelID string `param:"channelID"`
	GuildID   string `param:"guildID"`
}

func (r *CreateGuildRoleChannelAssocRequest) ToCreateGuildRoleChannelAssociationCommand(requestorID string) (*command.CreateGuildRoleChannelAssociationCommand, error) {

	if strings.Trim(r.RoleID, " ") == "" || strings.Trim(r.ChannelID, " ") == "" || strings.Trim(r.GuildID, " ") == "" {
		return nil, NewRequestValidationError("invalid role id, guild id and/or channel id")
	}

	return &command.CreateGuildRoleChannelAssociationCommand{
		RoleID:      r.RoleID,
		ChannelID:   r.ChannelID,
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}, nil
}
