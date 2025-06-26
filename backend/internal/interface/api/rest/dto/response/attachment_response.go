package response

import "time"

type AttachmentResponse struct {
	ID           string    `json:"id"`
	ResourceType string    `json:"resourceType"`
	Height       *int64    `json:"height"`
	Width        *int64    `json:"width"`
	Filesize     int64     `json:"filesize"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
	Status       int8      `json:"status"`
}
