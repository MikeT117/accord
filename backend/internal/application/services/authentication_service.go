package services

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
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

func (s *AuthenticationService) GetGithubAuthCodeURL() string {
	return s.oAuth.GetGithubAuthCodeURL()
}

func (s *AuthenticationService) GetOrCreateGithubAccountUser(
	ctx context.Context,
	code string,
	state string,
) (*command.CreateUserAccountIfNewCommandResult, error) {
	if err := s.oAuth.ValidateNonce(state); err != nil {
		return nil, err
	}

	githubUser, err := s.oAuth.GetGithubUser(ctx, code)
	if err != nil {
		return nil, err
	}

	user, err := s.getUserFromGithub(ctx, githubUser.ID)
	if err == nil {
		return &command.CreateUserAccountIfNewCommandResult{
			Result: mapper.NewUserResultFromUser(user),
		}, nil
	}

	if !errors.Is(err, domain.ErrEntityNotFound) {
		return nil, err
	}

	user, err = s.createUserFromGithub(ctx, githubUser)
	if err != nil {
		return nil, err
	}

	return &command.CreateUserAccountIfNewCommandResult{
		Result: mapper.NewUserResultFromUser(user),
	}, nil
}

func (s *AuthenticationService) getUserFromGithub(ctx context.Context, ID string) (*entities.User, error) {
	account, err := s.accountRepository.GetByProviderID(ctx, ID)
	if err != nil {
		return nil, err
	}

	return s.userRepository.GetByAccountID(ctx, account.ID)
}

func (s *AuthenticationService) createUserFromGithub(ctx context.Context, githubUser *oauth.GithubUser) (*entities.User, error) {
	account, err := entities.NewOAuthAccount(githubUser.ID, nil, nil, nil, nil, nil, nil)
	if err != nil {
		return nil, err
	}

	user, err := entities.NewUser(githubUser.Name, account.ID, githubUser.Email, nil, nil)
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

	return user, nil
}
