package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type CreateGuildBanRequest struct {
	GuildID string `param:"guildID"`
	UserID  string `param:"userID"`
	Reason  string `json:"reason"`
}

func (r *CreateGuildBanRequest) ToCreateGuildBanCommand(requestorID string) (*command.CreateGuildBanCommand, error) {
	if strings.Trim(r.GuildID, " ") == "" || strings.Trim(r.UserID, " ") == "" || strings.Trim(r.Reason, " ") == "" {
		return nil, NewRequestValidationError("invalid guild id, reason and/or user id")
	}
	return &command.CreateGuildBanCommand{
		GuildID:     r.GuildID,
		UserID:      r.UserID,
		RequestorID: requestorID,
	}, nil
}
