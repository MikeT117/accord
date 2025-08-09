package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type DeleteGuildBanRequest struct {
	GuildID uuid.UUID `param:"guildID"`
	UserID  uuid.UUID `param:"userID"`
}

func (r *DeleteGuildBanRequest) ToDeleteGuildBanCommand(requestorID uuid.UUID) (*command.DeleteGuildBanCommand, error) {
	return &command.DeleteGuildBanCommand{
		GuildID:     r.GuildID,
		UserID:      r.UserID,
		RequestorID: requestorID,
	}, nil
}
