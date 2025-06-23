package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type UserAccountService interface {
	GetByID(ctx context.Context, ID string) (*query.UserQueryResult, error)
	UpdateUserAccount(ctx context.Context, cmd *command.UpdateUserCommand, requestorID string) error
}
