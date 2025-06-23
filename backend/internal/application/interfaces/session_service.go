package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type SessionService interface {
	GetByID(ctx context.Context, ID string, userID string) (*query.SessionQueryResult, error)
	GetByToken(ctx context.Context, token string) (*query.SessionQueryResult, error)
	GetByUserID(ctx context.Context, userID string) (*query.SessionQueryListResult, error)
	CreateSession(ctx context.Context, sessionCommand *command.CreateSessionCommand) error
	DeleteSessionByID(ctx context.Context, ID string, userID string) error
	DeleteSessionByToken(ctx context.Context, token string, userID string) error
}
