package command

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/google/uuid"
)

type CreateGuildInviteCommand struct {
	GuildID     uuid.UUID
	ExpiresAt   time.Time
	RequestorID uuid.UUID
}

type CreateGuildInviteCommandResult struct {
	Result *common.GuildInviteResult
}
