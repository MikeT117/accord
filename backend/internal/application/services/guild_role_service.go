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
	transactor            *db.Transactor
	guildRoleRepository   *db.GuildRoleRepository
	guildMemberRepository *db.GuildMemberRepository
}

func CreateGuildRoleService(transactor *db.Transactor, guildRoleRepository *db.GuildRoleRepository, guildMemberRepository *db.GuildMemberRepository) interfaces.GuildRoleService {
	return &GuildRoleService{
		transactor:            transactor,
		guildRoleRepository:   guildRoleRepository,
		guildMemberRepository: guildMemberRepository,
	}
}

func (s *GuildRoleService) GetByID(ctx context.Context, ID string) (*query.GuildRoleQueryResult, error) {
	role, err := s.guildRoleRepository.GetByID(ctx, ID)
	if err != nil {
		return nil, err
	}

	return &query.GuildRoleQueryResult{
		Result: mapper.NewGuildRoleResultFromGuildRole(role),
	}, nil
}

func (s *GuildRoleService) GetByGuildID(ctx context.Context, guildID string) (*query.GuildRoleQueryListResult, error) {
	role, _, err := s.guildRoleRepository.GetByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	return &query.GuildRoleQueryListResult{
		Result: mapper.NewGuildRoleListResultFromGuildRole(role),
	}, nil
}

func (s *GuildRoleService) Create(ctx context.Context, cmd *command.CreateGuildRoleCommand) error {
	guildRoleEntity, err := entities.NewGuildRole(cmd.GuildID, cmd.Name)
	if err != nil {
		return err
	}

	return s.guildRoleRepository.Create(ctx, guildRoleEntity)
}

func (s *GuildRoleService) Update(ctx context.Context, cmd *command.UpdateGuildRoleCommand) error {
	guildRole, err := s.guildRoleRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	guildRole.UpdateName(cmd.Name)
	guildRole.UpdatedPermissions(cmd.Permissions)

	return s.guildRoleRepository.Update(ctx, guildRole)
}

func (s *GuildRoleService) Delete(ctx context.Context, ID string) error {
	return s.guildRoleRepository.Delete(ctx, ID)
}

func (s *GuildRoleService) CreateUserAssoc(ctx context.Context, roleID string, userID string) error {
	return s.guildRoleRepository.AssociateUser(ctx, roleID, userID)
}

func (s *GuildRoleService) DeleteUserAssoc(ctx context.Context, roleID string, userID string) error {
	return s.guildRoleRepository.DisassociateUser(ctx, roleID, userID)
}

func (s *GuildRoleService) CreateChannelAssoc(ctx context.Context, roleID string, channelID string) error {
	return s.guildRoleRepository.AssociateChannel(ctx, roleID, channelID)
}

func (s *GuildRoleService) DeleteChannelAssoc(ctx context.Context, roleID string, channelID string) error {
	return s.guildRoleRepository.DisassociateChannel(ctx, roleID, channelID)
}
