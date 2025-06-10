package command

type CreateSessionCommand struct {
	UserID    string
	Token     string
	IPAddress string
	UserAgent string
	ExpiresAt int64
}
