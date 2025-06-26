package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type UserAccountService struct {
	transactor        *db.Transactor
	accountRepository repositories.AccountRepository
	userRepository    repositories.UserRepository
}

func CreateUserAccountService(
	transactor *db.Transactor,
	accountRepository repositories.AccountRepository,
	userRepository repositories.UserRepository,
) interfaces.UserAccountService {
	return &UserAccountService{
		transactor:        transactor,
		accountRepository: accountRepository,
		userRepository:    userRepository,
	}
}

func (s *UserAccountService) GetByID(ctx context.Context, ID string) (*query.UserQueryResult, error) {
	user, err := s.userRepository.GetByID(ctx, ID)
	if err != nil {
		return nil, err
	}

	return &query.UserQueryResult{
		Result: mapper.NewUserResultFromUser(user),
	}, nil
}

func (s *UserAccountService) UpdateUserAccount(ctx context.Context, cmd *command.UpdateUserCommand) error {
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

	return nil
}
