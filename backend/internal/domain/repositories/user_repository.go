package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type UserRepository interface {
	GetByID(ctx context.Context, ID string) (*entities.User, error)
	GetByAccountID(ctx context.Context, accountID string) (*entities.User, error)
	GetMapByIDs(ctx context.Context, IDs []string) (map[string]*entities.User, error)
	GetByIDs(ctx context.Context, IDs []string) ([]*entities.User, error)
	GetByEmail(ctx context.Context, email string) (*entities.User, error)
	Create(ctx context.Context, user *entities.User) error
	Update(ctx context.Context, user *entities.User) error
}
