package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type UserRepository interface {
	GetByID(context context.Context, ID string) (*entities.User, error)
	GetByEmail(context context.Context, email string) (*entities.User, error)
	Create(context context.Context, validatedUser *entities.ValidatedUser) (*entities.User, error)
	Update(context context.Context, validatedUser *entities.ValidatedUser) (*entities.User, error)
}
