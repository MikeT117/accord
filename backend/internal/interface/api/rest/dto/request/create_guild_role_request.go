package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type CreateGuildRoleRequest struct {
	GuildID uuid.UUID `param:"guildID"`
}

func (r *CreateGuildRoleRequest) ToCreateGuildRoleCommand(requestorID uuid.UUID) (*command.CreateGuildRoleCommand, error) {
	return &command.CreateGuildRoleCommand{
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}, nil
}
