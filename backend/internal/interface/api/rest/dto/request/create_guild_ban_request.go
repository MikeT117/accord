package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type CreateGuildBanRequest struct {
	GuildID uuid.UUID `param:"guildID"`
	UserID  uuid.UUID `param:"userID"`
	Reason  string    `json:"reason"`
}

func (r *CreateGuildBanRequest) ToCreateGuildBanCommand(requestorID uuid.UUID) (*command.CreateGuildBanCommand, error) {
	if strings.Trim(r.Reason, " ") == "" {
		return nil, NewRequestValidationError("invalid reason")
	}
	return &command.CreateGuildBanCommand{
		GuildID:     r.GuildID,
		UserID:      r.UserID,
		RequestorID: requestorID,
	}, nil
}
