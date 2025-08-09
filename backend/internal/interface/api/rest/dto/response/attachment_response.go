package response

import "github.com/google/uuid"

type AttachmentResponse struct {
	ID           uuid.UUID `json:"id"`
	Filename     string    `json:"filename"`
	ResourceType string    `json:"resourceType"`
	OwnerID      uuid.UUID `json:"ownerId"`
	Height       *int64    `json:"height"`
	Width        *int64    `json:"width"`
	Filesize     int64     `json:"filesize"`
	CreatedAt    int64     `json:"createdAt"`
	UpdatedAt    int64     `json:"updatedAt"`
	Status       int8      `json:"status"`
}
