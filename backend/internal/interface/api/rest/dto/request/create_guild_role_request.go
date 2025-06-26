package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type CreateGuildRoleRequest struct {
	GuildID string `param:"guildID"`
	Name    string `json:"name"`
}

func (r *CreateGuildRoleRequest) ToCreateGuildRoleCommand(requestorID string) (*command.CreateGuildRoleCommand, error) {
	if r.GuildID == "" || strings.Trim(r.Name, " ") == "" {
		return nil, NewRequestValidationError("invalid guild id and/or name")
	}
	return &command.CreateGuildRoleCommand{
		GuildID:     r.GuildID,
		Name:        r.Name,
		RequestorID: requestorID,
	}, nil
}
