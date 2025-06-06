package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type AccountRepository interface {
	GetByID(context context.Context, ID string) (*entities.Account, error)
	GetByUserID(context context.Context, ID string) (*entities.Account, error)
	GetByAccountID(context context.Context, ID string) (*entities.Account, error)
	GetByProviderID(context context.Context, ID string) (*entities.Account, error)
	Create(context context.Context, validatedAccount *entities.ValidatedAccount) (*entities.Account, error)
	Update(context context.Context, validatedAccount *entities.ValidatedAccount) (*entities.Account, error)
	Delete(context context.Context, ID string) error
}
