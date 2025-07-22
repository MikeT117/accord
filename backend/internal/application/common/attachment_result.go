package common

import "time"

type AttachmentResult struct {
	ID           string
	Filename     string
	ResourceType string
	Height       *int64
	Width        *int64
	OwnerID      string
	Filesize     int64
	CreatedAt    time.Time
	UpdatedAt    time.Time
	Status       int8
}
