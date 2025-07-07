package response

type SessionResponse struct {
	ID        string `json:"id"`
	UserID    string `json:"userId"`
	Token     string `json:"token"`
	IPAddress string `json:"ipAddress"`
	UserAgent string `json:"userAgent"`
	CreatedAt int64  `json:"createdAt"`
	UpdatedAt int64  `json:"updatedAt"`
}
