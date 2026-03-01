package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/MikeT117/accord/backend/internal/infra/db"
	"github.com/google/uuid"
)

type UserAccountService struct {
	transactor        *db.Transactor
	eventService      interfaces.EventService
	accountRepository repositories.AccountRepository
	userRepository    repositories.UserRepository
}

func CreateUserAccountService(
	transactor *db.Transactor,
	eventService interfaces.EventService,
	accountRepository repositories.AccountRepository,
	userRepository repositories.UserRepository,
) interfaces.UserAccountService {
	return &UserAccountService{
		transactor:        transactor,
		eventService:      eventService,
		accountRepository: accountRepository,
		userRepository:    userRepository,
	}
}

func (s *UserAccountService) GetUniqueUsername(ctx context.Context, username string) (bool, error) {
	_, err := s.userRepository.GetByUsername(ctx, username)
	if err != nil {
		if domain.IsDomainNotFoundErr(err) {
			return true, nil
		}

		return false, err
	}

	return false, nil
}

func (s *UserAccountService) GetByID(ctx context.Context, ID uuid.UUID) (*query.UserQueryResult, error) {
	user, err := s.userRepository.GetByID(ctx, ID)
	if err != nil {
		return nil, err
	}

	return &query.UserQueryResult{
		Result: mapper.NewUserResultFromUser(user),
	}, nil
}

func (s *UserAccountService) GetUserByProviderID(ctx context.Context, providerID string, provider string) (*query.UserQueryResult, error) {
	account, err := s.accountRepository.GetByProviderID(ctx, providerID, provider)
	if err != nil {
		return nil, err
	}

	user, err := s.userRepository.GetByAccountID(ctx, account.ID)
	if err != nil {
		return nil, err
	}

	return &query.UserQueryResult{
		Result: mapper.NewUserResultFromUser(user),
	}, nil
}

func (s *UserAccountService) UpdateUserAccount(ctx context.Context, cmd *command.UpdateUserCommand) error {
	if cmd.ID != cmd.RequestorID {
		return ErrNotAuthorised
	}

	user, err := s.userRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if err := user.UpdateDisplayName(cmd.DisplayName); err != nil {
		return err
	}
	if err := user.UpdatePublicFlags(cmd.PublicFlags); err != nil {
		return err
	}
	if err := user.UpdateAvatarID(cmd.AvatarID); err != nil {
		return err
	}
	if err := user.UpdateBannerID(cmd.BannerID); err != nil {
		return err
	}

	if err := s.userRepository.Update(ctx, user); err != nil {
		return err
	}

	return s.eventService.UserUpdated(ctx, user.ID)
}
