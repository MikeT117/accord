package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/infra/oauth"
)

type AuthenticationService interface {
	GetOAuthCodeURL(provider string) (string, error)
	GetOAuthProfile(
		ctx context.Context,
		code string,
		state string,
		provider string,
	) (*oauth.OAuthUser, error)
	CreateOrGetOAuthAccountUser(
		ctx context.Context,
		providerID string,
		provider string,
		email string,
		username string,
		displayname string,
	) (*command.CreateUserAccountCommandResult, bool, error)
	CompleteUserRegistration(ctx context.Context, cmd *command.CompleteUserRegistrationCommand) error
}
