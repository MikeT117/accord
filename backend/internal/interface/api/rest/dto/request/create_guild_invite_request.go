package request

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type CreateGuildInviteRequest struct {
	GuildID   string    `param:"guildID"`
	ExpiresAt time.Time `json:"expiresAt"`
}

func (r *CreateGuildInviteRequest) ToCreateGuildInviteCommand(requestorID string) (*command.CreateGuildInviteCommand, error) {
	if r.GuildID == "" {
		return nil, NewRequestValidationError("invalid guild id")
	}
	return &command.CreateGuildInviteCommand{
		GuildID:     r.GuildID,
		ExpiresAt:   r.ExpiresAt,
		RequestorID: requestorID,
	}, nil
}
