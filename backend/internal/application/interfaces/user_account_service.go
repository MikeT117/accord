package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/google/uuid"
)

type UserAccountService interface {
	GetUniqueUsername(ctx context.Context, username string) (bool, error)
	GetByID(ctx context.Context, ID uuid.UUID) (*query.UserQueryResult, error)
	GetUserByProviderID(ctx context.Context, providerID string, provider string) (*query.UserQueryResult, error)
	UpdateUserAccount(ctx context.Context, cmd *command.UpdateUserCommand) error
}
