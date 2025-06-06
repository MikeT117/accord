package interfaces

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type SessionService interface {
	GetByID(ID string, userID string) (*query.SessionQueryResult, error)
	GetByToken(token string, userID string) (*query.SessionQueryResult, error)
	GetByUserID(userID string) (*query.SessionQueryListResult, error)
	CreateSession(sessionCommand *command.CreateSessionCommand) (*command.CreateSessionCommandResult, error)
	DeleteSessionByID(ID string, userID string) error
	DeleteSessionByToken(token string, userID string) error
}
