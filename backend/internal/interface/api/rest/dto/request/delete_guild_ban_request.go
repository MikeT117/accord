package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type DeleteGuildBanRequest struct {
	GuildID string `param:"guildID"`
	UserID  string `param:"userID"`
}

func (r *DeleteGuildBanRequest) ToDeleteGuildBanCommand(requestorID string) (*command.DeleteGuildBanCommand, error) {
	if r.GuildID == "" || strings.Trim(r.UserID, " ") == "" {
		return nil, NewRequestValidationError("invalid guild id and/or user id")
	}
	return &command.DeleteGuildBanCommand{
		GuildID:     r.GuildID,
		UserID:      r.UserID,
		RequestorID: requestorID,
	}, nil
}
