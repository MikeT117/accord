package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type GuildRoleService struct {
	repositories *db.MasterRepository
}

func CreateGuildRoleService(repositories *db.MasterRepository) interfaces.GuildRoleService {
	return &GuildRoleService{
		repositories: repositories,
	}
}

func (s *GuildRoleService) GetByID(ctx context.Context, ID string) (*query.GuildRoleQueryResult, error) {
	role, err := s.repositories.GuildRoleRepository.GetByID(ctx, ID)
	if err != nil {
		return nil, err
	}

	return &query.GuildRoleQueryResult{
		Result: mapper.NewGuildRoleResultFromGuildRole(role),
	}, nil
}

func (s *GuildRoleService) GetByGuildID(ctx context.Context, guildID string) (*query.GuildRoleQueryListResult, error) {
	role, _, err := s.repositories.GuildRoleRepository.GetByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	return &query.GuildRoleQueryListResult{
		Result: mapper.NewGuildRoleListResultFromGuildRole(role),
	}, nil
}

func (s *GuildRoleService) Create(ctx context.Context, createCommand *command.CreateGuildRoleCommand) (*command.CreateGuildRoleCommandResult, error) {
	guildRoleEntity, err := entities.NewGuildRole(createCommand.GuildID, createCommand.Name)
	if err != nil {
		return nil, err
	}

	validatedGuildRoleEntity, err := entities.NewValidatedGuildRole(guildRoleEntity)
	if err != nil {
		return nil, err
	}

	guildRole, err := s.repositories.GuildRoleRepository.Create(ctx, validatedGuildRoleEntity)
	if err != nil {
		return nil, err
	}

	return &command.CreateGuildRoleCommandResult{
		Result: mapper.NewGuildRoleResultFromGuildRole(guildRole),
	}, nil
}

func (s *GuildRoleService) Update(ctx context.Context, updateCommand *command.UpdateGuildRoleCommand) (*command.UpdateGuildRoleCommandResult, error) {
	guildRole, err := s.repositories.GuildRoleRepository.GetByID(ctx, updateCommand.ID)
	if err != nil {
		return nil, err
	}

	updatedGuildRoleEntity := entities.UpdatedGuildRole(guildRole.ID, updateCommand.Name, guildRole.GuildID, updateCommand.Permissions, guildRole.CreatedAt)

	validatedGuildRoleEntity, err := entities.NewValidatedGuildRole(updatedGuildRoleEntity)
	if err != nil {
		return nil, err
	}

	updatedGuildRole, err := s.repositories.GuildRoleRepository.Update(ctx, validatedGuildRoleEntity)
	if err != nil {
		return nil, err
	}

	return &command.UpdateGuildRoleCommandResult{
		Result: mapper.NewGuildRoleResultFromGuildRole(updatedGuildRole),
	}, nil
}

func (s *GuildRoleService) Delete(ctx context.Context, ID string) error {
	return s.repositories.GuildRoleRepository.Delete(ctx, ID)
}

func (s *GuildRoleService) CreateUserAssoc(ctx context.Context, roleID string, userID string) error {
	return s.repositories.GuildRoleUserRepository.CreateAssoc(ctx, roleID, userID)
}

func (s *GuildRoleService) DeleteUserAssoc(ctx context.Context, roleID string, userID string) error {
	return s.repositories.GuildRoleUserRepository.DeleteAssoc(ctx, roleID, userID)
}

func (s *GuildRoleService) CreateChannelAssoc(ctx context.Context, roleID string, channelID string) error {
	return s.repositories.GuildRoleChannelRepository.CreateAssoc(ctx, roleID, channelID)
}

func (s *GuildRoleService) DeleteChannelAssoc(ctx context.Context, roleID string, channelID string) error {
	return s.repositories.GuildRoleChannelRepository.DeleteAssoc(ctx, roleID, channelID)
}
