package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

type AccountRepository interface {
	GetByID(ctx context.Context, ID uuid.UUID) (*entities.Account, error)
	GetByUserID(ctx context.Context, ID uuid.UUID) (*entities.Account, error)
	GetByProviderID(ctx context.Context, ID string, provider string) (*entities.Account, error)
	Create(ctx context.Context, account *entities.Account) error
	Update(ctx context.Context, account *entities.Account) error
	Delete(ctx context.Context, ID uuid.UUID) error
}
