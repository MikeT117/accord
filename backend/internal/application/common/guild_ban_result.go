package common

import (
	"time"

	"github.com/google/uuid"
)

type GuildBanResult struct {
	UserID    uuid.UUID
	GuildID   uuid.UUID
	Reason    string
	CreatedAt time.Time
	UpdatedAt time.Time
}
