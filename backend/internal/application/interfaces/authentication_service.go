package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type AuthenticationService interface {
	GetGithubAuthCodeURL() string
	GetOrCreateGithubAccountUser(
		ctx context.Context,
		code string,
		state string,
	) (*command.CreateUserAccountIfNewCommandResult, error)
}
