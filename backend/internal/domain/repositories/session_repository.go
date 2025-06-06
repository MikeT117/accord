package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type SessionRepository interface {
	GetByID(context context.Context, ID string, userID string) (*entities.Session, error)
	GetByUserID(context context.Context, userID string) ([]*entities.Session, error)
	GetByToken(context context.Context, token string, userID string) (*entities.Session, error)
	Create(context context.Context, validatedSession *entities.ValidatedSession) (*entities.Session, error)
	Update(context context.Context, validatedSession *entities.ValidatedSession) (*entities.Session, error)
	DeleteByID(context context.Context, ID string, userID string) error
	DeleteByToken(context context.Context, token string, userID string) error
}
