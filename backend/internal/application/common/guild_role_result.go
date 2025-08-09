package common

import (
	"time"

	"github.com/google/uuid"
)

type GuildRoleResult struct {
	ID          uuid.UUID
	GuildID     uuid.UUID
	Name        string
	Permissions int32
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
