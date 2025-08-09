package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type DeleteGuildRoleRequest struct {
	ID      uuid.UUID `param:"roleID"`
	GuildID uuid.UUID `param:"guildID"`
}

func (r *DeleteGuildRoleRequest) ToDeleteGuildRoleCommand(requestorID uuid.UUID) (*command.DeleteGuildRoleCommand, error) {
	return &command.DeleteGuildRoleCommand{
		ID:          r.ID,
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}, nil
}
