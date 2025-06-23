package response

import "time"

type SessionResponse struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	Token     string    `json:"token"`
	IPAddress string    `json:"ipAddress"`
	UserAgent string    `json:"userAgent"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
