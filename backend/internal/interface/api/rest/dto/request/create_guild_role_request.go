package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
)

type CreateGuildRoleRequest struct {
	GuildID string `param:"guildID"`
}

func (r *CreateGuildRoleRequest) ToCreateGuildRoleCommand(requestorID string) (*command.CreateGuildRoleCommand, error) {
	if r.GuildID == "" {
		return nil, NewRequestValidationError("invalid guild id and/or name")
	}
	return &command.CreateGuildRoleCommand{
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}, nil
}
