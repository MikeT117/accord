package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type UpdateGuildRoleRequest struct {
	ID          uuid.UUID `param:"roleID"`
	GuildID     uuid.UUID `param:"guildID"`
	Name        string    `json:"name"`
	Permissions int32     `json:"permissions"`
}

func (r *UpdateGuildRoleRequest) ToUpdateGuildRoleCommand(requestorID uuid.UUID) (*command.UpdateGuildRoleCommand, error) {
	if strings.Trim(r.Name, " ") == "" {
		return nil, NewRequestValidationError("invalid name")
	}

	return &command.UpdateGuildRoleCommand{
		ID:          r.ID,
		GuildID:     r.GuildID,
		Name:        r.Name,
		Permissions: r.Permissions,
		RequestorID: requestorID,
	}, nil
}
