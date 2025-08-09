package common

import (
	"time"

	"github.com/google/uuid"
)

type AttachmentSignResult struct {
	ID        uuid.UUID
	Signature string
	CreatedAt time.Time
}
