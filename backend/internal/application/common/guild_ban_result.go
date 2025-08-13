package common

import (
	"time"

	"github.com/google/uuid"
)

type GuildBanResult struct {
	Avatar      *uuid.UUID
	Banner      *uuid.UUID
	Username    string
	DisplayName string
	UserID      uuid.UUID
	GuildID     uuid.UUID
	Reason      string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
