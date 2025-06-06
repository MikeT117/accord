package command

import "github.com/MikeT117/accord/backend/internal/application/common"

type CreateSessionCommand struct {
	UserID    string
	Token     string
	IPAddress string
	UserAgent string
	ExpiresAt int64
}

type CreateSessionCommandResult struct {
	Result *common.SessionResult
}
