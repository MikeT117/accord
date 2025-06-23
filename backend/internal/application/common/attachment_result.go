package common

import "time"

type AttachmentResult struct {
	ID           string
	ResourceType string
	OwnerID      string
	Height       *int64
	Width        *int64
	Filesize     int64
	CreatedAt    time.Time
	UpdatedAt    time.Time
	Status       int8
}
