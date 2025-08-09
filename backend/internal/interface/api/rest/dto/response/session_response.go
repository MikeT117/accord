package response

import "github.com/google/uuid"

type SessionResponse struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"userId"`
	Token     string    `json:"token"`
	IPAddress string    `json:"ipAddress"`
	UserAgent string    `json:"userAgent"`
	CreatedAt int64     `json:"createdAt"`
	UpdatedAt int64     `json:"updatedAt"`
}
