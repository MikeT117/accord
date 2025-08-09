package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type DeleteGuildRoleChannelAssocRequest struct {
	RoleID    uuid.UUID `param:"roleID"`
	ChannelID uuid.UUID `param:"channelID"`
	GuildID   uuid.UUID `param:"guildID"`
}

func (r *DeleteGuildRoleChannelAssocRequest) ToDeleteGuildRoleChannelAssociationCommand(requestorID uuid.UUID) (*command.DeleteGuildRoleChannelAssociationCommand, error) {

	return &command.DeleteGuildRoleChannelAssociationCommand{
		RoleID:      r.RoleID,
		ChannelID:   r.ChannelID,
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}, nil
}
