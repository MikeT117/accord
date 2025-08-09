package command

import (
	"time"

	"github.com/google/uuid"
)

type CreateGuildInviteCommand struct {
	GuildID     uuid.UUID
	ExpiresAt   time.Time
	RequestorID uuid.UUID
}
