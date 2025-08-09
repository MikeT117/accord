package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type DeleteGuildRoleUserAssocRequest struct {
	RoleID  uuid.UUID `param:"roleID"`
	UserID  uuid.UUID `param:"userID"`
	GuildID uuid.UUID `param:"guildID"`
}

func (r *DeleteGuildRoleUserAssocRequest) ToDeleteGuildRoleUserAssociationCommand(requestorID uuid.UUID) (*command.DeleteGuildRoleUserAssociationCommand, error) {
	return &command.DeleteGuildRoleUserAssociationCommand{
		RoleID:      r.RoleID,
		UserID:      r.UserID,
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}, nil
}
