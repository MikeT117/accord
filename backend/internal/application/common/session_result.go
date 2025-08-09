package common

import (
	"time"

	"github.com/google/uuid"
)

type SessionResult struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	Token     string
	ExpiresAt time.Time
	IPAddress string
	UserAgent string
	CreatedAt time.Time
	UpdatedAt time.Time
}
