package common

import (
	"time"

	"github.com/google/uuid"
)

type AttachmentResult struct {
	ID           uuid.UUID
	Filename     string
	ResourceType string
	Height       *int64
	Width        *int64
	OwnerID      uuid.UUID
	Filesize     int64
	CreatedAt    time.Time
	UpdatedAt    time.Time
	Status       int8
}
