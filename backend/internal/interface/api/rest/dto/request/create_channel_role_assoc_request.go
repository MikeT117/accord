package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type CreateGuildRoleChannelAssocRequest struct {
	RoleID    uuid.UUID `param:"roleID"`
	ChannelID uuid.UUID `param:"channelID"`
	GuildID   uuid.UUID `param:"guildID"`
}

func (r *CreateGuildRoleChannelAssocRequest) ToCreateGuildRoleChannelAssociationCommand(requestorID uuid.UUID) (*command.CreateGuildRoleChannelAssociationCommand, error) {
	return &command.CreateGuildRoleChannelAssociationCommand{
		RoleID:      r.RoleID,
		ChannelID:   r.ChannelID,
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}, nil
}
