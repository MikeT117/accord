package common

import "time"

type SessionResult struct {
	ID        string
	UserID    string
	Token     string
	ExpiresAt time.Time
	IPAddress string
	UserAgent string
	CreatedAt time.Time
	UpdatedAt time.Time
}
