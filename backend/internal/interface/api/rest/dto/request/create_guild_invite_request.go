package request

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type CreateGuildInviteRequest struct {
	GuildID   uuid.UUID `param:"guildID"`
	ExpiresAt time.Time `json:"expiresAt"`
}

func (r *CreateGuildInviteRequest) ToCreateGuildInviteCommand(requestorID uuid.UUID) (*command.CreateGuildInviteCommand, error) {
	return &command.CreateGuildInviteCommand{
		GuildID:     r.GuildID,
		ExpiresAt:   r.ExpiresAt,
		RequestorID: requestorID,
	}, nil
}
