package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type UpdateGuildRoleRequest struct {
	ID          string `param:"roleID"`
	GuildID     string `param:"guildID"`
	Name        string `json:"name"`
	Permissions int32  `json:"permissions"`
}

func (r *UpdateGuildRoleRequest) ToUpdateGuildRoleCommand(requestorID string) (*command.UpdateGuildRoleCommand, error) {
	if strings.Trim(r.ID, " ") == "" || strings.Trim(r.GuildID, " ") == "" || strings.Trim(r.Name, " ") == "" {
		return nil, NewRequestValidationError("invalid guild id and/or name")
	}

	return &command.UpdateGuildRoleCommand{
		ID:          r.ID,
		GuildID:     r.GuildID,
		Name:        r.Name,
		Permissions: r.Permissions,
		RequestorID: requestorID,
	}, nil
}
