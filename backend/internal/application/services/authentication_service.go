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

func (s *AuthenticationService) CreateOrGetOAuthAccountUser(
	ctx context.Context,
	providerID string,
	provider string,
	email string,
	username string,
	displayname string,
) (*command.CreateUserAccountCommandResult, bool, error) {
	existingAccount, err := s.accountRepository.GetByProviderID(ctx, providerID, provider)

	if err == nil {
		existingUser, err := s.userRepository.GetByAccountID(ctx, existingAccount.ID)
		if err != nil {
			return nil, false, err
		}

		return &command.CreateUserAccountCommandResult{
			Result: mapper.NewUserResultFromUser(existingUser),
		}, existingUser.IsRegistrationComplete(), nil
	}

	if !domain.IsDomainNotFoundErr(err) {
		return nil, false, err
	}

	account, err := entities.NewOAuthAccount(provider, providerID, nil, nil, nil, nil, nil, nil)
	if err != nil {
		return nil, false, err
	}

	user, err := entities.NewUser(username, displayname, account.ID, email, nil, nil)
	if err != nil {
		return nil, false, err
	}

	if err := s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		if err = s.accountRepository.Create(ctx, account); err != nil {
			return err
		}

		return s.userRepository.Create(ctx, user)
	}); err != nil {
		return nil, false, err
	}

	return &command.CreateUserAccountCommandResult{
		Result: mapper.NewUserResultFromUser(user),
	}, user.IsRegistrationComplete(), nil
}

func (s *AuthenticationService) CompleteUserRegistration(ctx context.Context, cmd *command.CompleteUserRegistrationCommand) error {
	user, err := s.userRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if err := user.UpdateDisplayName(cmd.DisplayName); err != nil {
		return err
	}
	if err := user.UpdateUsername(cmd.Username); err != nil {
		return err
	}
	if err := user.UpdateRegistrationStatus(); err != nil {
		return err
	}

	if err := s.userRepository.Update(ctx, user); err != nil {
		return err
	}

	return nil
}
