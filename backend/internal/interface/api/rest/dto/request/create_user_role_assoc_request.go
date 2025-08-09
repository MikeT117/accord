package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type CreateGuildRoleUserAssocRequest struct {
	RoleID  uuid.UUID   `param:"roleID"`
	GuildID uuid.UUID   `param:"guildID"`
	UserIDs []uuid.UUID `json:"userIds"`
}

func (r *CreateGuildRoleUserAssocRequest) ToCreateGuildRoleUserAssociationCommand(requestorID uuid.UUID) (*command.CreateGuildRoleUserAssociationCommand, error) {

	if len(r.UserIDs) == 0 {
		return nil, NewRequestValidationError("user ids empty")
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
