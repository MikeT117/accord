package models

import (
	"time"

	"github.com/google/uuid"
)

type Attachment struct {
	ID            uuid.UUID `json:"id"`
	ResourceType  string    `json:"resourceType"`
	Signature     string    `json:"signature"`
	UnixTimestamp int64     `json:"unixTimestamp"`
	AttachedByID  uuid.UUID `json:"attachedById"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type SignedAttachment struct {
	ID        uuid.UUID `json:"id"`
	UploadURL string    `json:"uploadURL"`
}
