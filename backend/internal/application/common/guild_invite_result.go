package common

import (
	"time"

	"github.com/google/uuid"
)

type GuildInviteResult struct {
	ID          uuid.UUID
	CreatorID   uuid.UUID
	UsedCount   int64
	CreatedAt   time.Time
	UpdatedAt   time.Time
	ExpiresAt   time.Time
	DisplayName string
	Username    string
	Avatar      *uuid.UUID
}
