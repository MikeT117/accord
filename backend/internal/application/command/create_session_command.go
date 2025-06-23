package command

import "time"

type CreateSessionCommand struct {
	UserID    string
	Token     string
	IPAddress string
	UserAgent string
	ExpiresAt time.Time
}
