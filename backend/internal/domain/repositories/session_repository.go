package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type SessionRepository interface {
	GetByID(ctx context.Context, ID string, userID string) (*entities.Session, error)
	GetByUserID(ctx context.Context, userID string) ([]*entities.Session, error)
	GetByToken(ctx context.Context, token string) (*entities.Session, error)
	Create(ctx context.Context, validatedSession *entities.Session) error
	Update(ctx context.Context, validatedSession *entities.Session) error
	DeleteByID(ctx context.Context, ID string) error
}
