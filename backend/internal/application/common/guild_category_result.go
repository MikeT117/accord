package common

import (
	"time"

	"github.com/google/uuid"
)

type GuildCategoryResult struct {
	ID        uuid.UUID
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
}
