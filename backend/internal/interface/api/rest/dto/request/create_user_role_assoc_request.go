package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type CreateGuildRoleUserAssocRequest struct {
	RoleID  string `param:"roleID"`
	UserID  string `param:"userID"`
	GuildID string `param:"guildID"`
}

func (r *CreateGuildRoleUserAssocRequest) ToCreateGuildRoleUserAssociationCommand(requestorID string) (*command.CreateGuildRoleUserAssociationCommand, error) {

	if strings.Trim(r.RoleID, " ") == "" || strings.Trim(r.UserID, " ") == "" || strings.Trim(r.GuildID, " ") == "" {
		return nil, NewRequestValidationError("invalid role id, guild id and/or user id")
	}

	return &command.CreateGuildRoleUserAssociationCommand{
		RoleID:      r.RoleID,
		UserID:      r.UserID,
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}, nil
}
