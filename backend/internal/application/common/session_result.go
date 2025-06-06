package common

type SessionResult struct {
	ID        string
	UserID    string
	Token     string
	ExpiresAt int64
	IPAddress string
	UserAgent string
	CreatedAt int64
	UpdatedAt int64
}
