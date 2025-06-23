package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/MikeT117/accord/backend/internal/constants"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type GuildRoleService struct {
	transactor            *db.Transactor
	authorisationService  interfaces.AuthorisationService
	guildRoleRepository   repositories.GuildRoleRepository
	guildMemberRepository repositories.GuildMemberRepository
}

func CreateGuildRoleService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, guildRoleRepository repositories.GuildRoleRepository, guildMemberRepository repositories.GuildMemberRepository) interfaces.GuildRoleService {
	return &GuildRoleService{
		transactor:            transactor,
		authorisationService:  authorisationService,
		guildRoleRepository:   guildRoleRepository,
		guildMemberRepository: guildMemberRepository,
	}
}

func (s *GuildRoleService) GetByGuildID(ctx context.Context, guildID string, requestorID string) (*query.GuildRoleQueryListResult, error) {
	err := s.authorisationService.VerifyGuildMember(ctx, guildID, requestorID)
	if err != nil {
		return nil, err
	}

	role, _, err := s.guildRoleRepository.GetByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	return &query.GuildRoleQueryListResult{
		Result: mapper.NewGuildRoleListResultFromGuildRole(role),
	}, nil
}

func (s *GuildRoleService) Create(ctx context.Context, cmd *command.CreateGuildRoleCommand, requestorID string) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, requestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	guildRoleEntity, err := entities.NewGuildRole(cmd.GuildID, cmd.Name)
	if err != nil {
		return err
	}

	if err := s.guildRoleRepository.Create(ctx, guildRoleEntity); err != nil {
		return err
	}

	return nil
}

func (s *GuildRoleService) Update(ctx context.Context, cmd *command.UpdateGuildRoleCommand, requestorID string) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, requestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	guildRole, err := s.guildRoleRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if err := guildRole.UpdateName(cmd.Name); err != nil {
		return err
	}
	if err := guildRole.UpdatedPermissions(cmd.Permissions); err != nil {
		return err
	}

	if err := s.guildRoleRepository.Update(ctx, guildRole); err != nil {
		return err
	}

	return nil
}

func (s *GuildRoleService) Delete(ctx context.Context, ID string, requestorID string) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, ID, requestorID, constants.GUILD_OWNER_PERMISSION)
	if err != nil {
		return err
	}

	if err := s.guildRoleRepository.Delete(ctx, ID); err != nil {
		return err
	}

	return nil
}

func (s *GuildRoleService) CreateUserAssoc(ctx context.Context, roleID string, userID string, guildID string, requestorID string) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, guildID, requestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	if err := s.guildRoleRepository.AssociateUser(ctx, roleID, userID); err != nil {
		return err
	}

	return nil
}

func (s *GuildRoleService) DeleteUserAssoc(ctx context.Context, roleID string, userID string, guildID string, requestorID string) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, guildID, requestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	if err := s.guildRoleRepository.DisassociateUser(ctx, roleID, userID); err != nil {
		return err
	}

	return nil
}

func (s *GuildRoleService) CreateChannelAssoc(ctx context.Context, roleID string, channelID string, guildID string, requestorID string) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, guildID, requestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	if err := s.guildRoleRepository.AssociateChannel(ctx, roleID, channelID); err != nil {
		return err
	}

	return nil
}

func (s *GuildRoleService) DeleteChannelAssoc(ctx context.Context, roleID string, channelID string, guildID string, requestorID string) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, guildID, requestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	if err := s.guildRoleRepository.DisassociateChannel(ctx, roleID, channelID); err != nil {
		return err
	}

	return nil
}
