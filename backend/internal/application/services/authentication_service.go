package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/constants"
	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/MikeT117/accord/backend/internal/infra/db"
	"github.com/MikeT117/accord/backend/internal/infra/oauth"
	"github.com/google/uuid"
)

type AuthenticationService struct {
	transactor        *db.Transactor
	oAuth             *oauth.OAuth
	userRepository    repositories.UserRepository
	accountRepository repositories.AccountRepository
}

func CreateAuthenticationService(
	transactor *db.Transactor,
	oAuth *oauth.OAuth,
	userRepository repositories.UserRepository,
	accountRepository repositories.AccountRepository,
) interfaces.AuthenticationService {
	return &AuthenticationService{
		transactor:        transactor,
		oAuth:             oAuth,
		userRepository:    userRepository,
		accountRepository: accountRepository,
	}
}

func (s *AuthenticationService) GetUniqueUsername(ctx context.Context, username string) (bool, error) {
	_, err := s.userRepository.GetByUsername(ctx, username)
	if err != nil {
		if domain.IsDomainNotFoundErr(err) {
			return true, nil
		}

		return false, err
	}

	return false, nil
}

func (s *AuthenticationService) GetOAuthCodeURL(provider string) (string, error) {
	if provider == constants.PROVIDER_OAUTH_GITHUB {
		return s.oAuth.GetGithubAuthCodeURL()
	}

	return s.oAuth.GetGitlabAuthCodeURL()
}

func (s *AuthenticationService) GetOAuthProfile(
	ctx context.Context,
	code string,
	state string,
	provider string,
) (*oauth.OAuthUser, error) {
	if err := s.oAuth.ValidateNonce(state); err != nil {
		return nil, err
	}

	if provider == constants.PROVIDER_OAUTH_GITHUB {
		return s.oAuth.GetGithubUser(ctx, code)
	}

	return s.oAuth.GetGitlabUser(ctx, code)
}

func (s *AuthenticationService) GetUserIDByProviderID(ctx context.Context, providerID string, provider string) (uuid.UUID, error) {
	account, err := s.accountRepository.GetByProviderID(ctx, providerID, provider)
	if err != nil {
		return uuid.UUID{}, err
	}

	user, err := s.userRepository.GetByAccountID(ctx, account.ID)
	if err != nil {
		return uuid.UUID{}, err
	}

	return user.ID, nil

}

func (s *AuthenticationService) CreateOAuthAccountUser(
	ctx context.Context,
	providerID string,
	provider string,
	email string,
	username string,
	displayname string,
) (*command.CreateUserAccountIfNewCommandResult, error) {

	account, err := entities.NewOAuthAccount(provider, providerID, nil, nil, nil, nil, nil, nil)
	if err != nil {
		return nil, err
	}

	user, err := entities.NewUser(username, displayname, account.ID, email, nil, nil)
	if err != nil {
		return nil, err
	}

	if err := s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		if err = s.accountRepository.Create(ctx, account); err != nil {
			return err
		}

		return s.userRepository.Create(ctx, user)
	}); err != nil {
		return nil, err
	}

	return &command.CreateUserAccountIfNewCommandResult{
		Result: mapper.NewUserResultFromUser(user),
	}, nil
}
