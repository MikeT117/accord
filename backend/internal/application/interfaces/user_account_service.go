package interfaces

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type UserAccountService interface {
	GetByID(ID string) (*query.UserQueryResult, error)
	GetByEmail(email string) (*query.UserQueryResult, error)
	GetByProviderID(providerID string) (*query.UserQueryResult, error)
	CreateUserAccount(command *command.CreateUserAccountCommand) error
	UpdateUser(command *command.UpdateUserCommand) error
}
