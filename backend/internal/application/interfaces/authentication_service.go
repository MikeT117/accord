package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/infra/oauth"
	"github.com/google/uuid"
)

type AuthenticationService interface {
	GetOAuthCodeURL(provider string) (string, error)
	GetOAuthProfile(
		ctx context.Context,
		code string,
		state string,
		provider string,
	) (*oauth.OAuthUser, error)
	GetUserIDByProviderID(ctx context.Context, providerID string, provider string) (uuid.UUID, error)
	GetUniqueUsername(ctx context.Context, username string) (bool, error)
	CreateOAuthAccountUser(
		ctx context.Context,
		providerID string,
		provider string,
		email string,
		username string,
		displayname string,
	) (*command.CreateUserAccountIfNewCommandResult, error)
}
