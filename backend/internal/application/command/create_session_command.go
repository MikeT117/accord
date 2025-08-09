package command

import (
	"time"

	"github.com/google/uuid"
)

type CreateSessionCommand struct {
	UserID    uuid.UUID
	Token     string
	IPAddress string
	UserAgent string
	ExpiresAt time.Time
}
