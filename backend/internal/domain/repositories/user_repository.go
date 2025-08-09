package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

type UserRepository interface {
	GetByID(ctx context.Context, ID uuid.UUID) (*entities.User, error)
	GetByAccountID(ctx context.Context, accountID uuid.UUID) (*entities.User, error)
	GetMapByIDs(ctx context.Context, IDs []uuid.UUID) (map[uuid.UUID]*entities.User, error)
	GetByIDs(ctx context.Context, IDs []uuid.UUID) ([]*entities.User, error)
	GetByEmail(ctx context.Context, email string) (*entities.User, error)
	Create(ctx context.Context, user *entities.User) error
	Update(ctx context.Context, user *entities.User) error
}
