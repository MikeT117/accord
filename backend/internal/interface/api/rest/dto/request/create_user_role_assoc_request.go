package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type CreateGuildRoleUserAssocRequest struct {
	RoleID  string   `param:"roleID"`
	GuildID string   `param:"guildID"`
	UserIDs []string `json:"userIds"`
}

func (r *CreateGuildRoleUserAssocRequest) ToCreateGuildRoleUserAssociationCommand(requestorID string) (*command.CreateGuildRoleUserAssociationCommand, error) {

	if strings.Trim(r.RoleID, " ") == "" || len(r.UserIDs) == 0 || strings.Trim(r.GuildID, " ") == "" {
		return nil, NewRequestValidationError("invalid role id or guild id")
	}

	if len(r.UserIDs) == 0 {
		return nil, NewRequestValidationError("user ids cannot be empty")
	}

	return &command.CreateGuildRoleUserAssociationCommand{
		RoleID:      r.RoleID,
		UserIDs:     r.UserIDs,
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}, nil
}
