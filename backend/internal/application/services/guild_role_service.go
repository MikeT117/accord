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
	eventService          interfaces.EventService
	guildRoleRepository   repositories.GuildRoleRepository
	guildMemberRepository repositories.GuildMemberRepository
}

func CreateGuildRoleService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, eventService interfaces.EventService, guildRoleRepository repositories.GuildRoleRepository, guildMemberRepository repositories.GuildMemberRepository) interfaces.GuildRoleService {
	return &GuildRoleService{
		transactor:            transactor,
		authorisationService:  authorisationService,
		eventService:          eventService,
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

func (s *GuildRoleService) Create(ctx context.Context, cmd *command.CreateGuildRoleCommand) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, cmd.RequestorID, constants.MANAGE_GUILD_PERMISSION)
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

	return s.eventService.GuildRoleCreated(ctx, guildRoleEntity.ID)
}

func (s *GuildRoleService) Update(ctx context.Context, cmd *command.UpdateGuildRoleCommand) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, cmd.RequestorID, constants.MANAGE_GUILD_PERMISSION)
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

	return s.eventService.GuildRoleUpdated(ctx, guildRole.ID)
}

func (s *GuildRoleService) Delete(ctx context.Context, cmd *command.DeleteGuildRoleCommand) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, cmd.RequestorID, constants.GUILD_OWNER_PERMISSION)
	if err != nil {
		return err
	}

	if err := s.guildRoleRepository.Delete(ctx, cmd.ID); err != nil {
		return err
	}

	return s.eventService.GuildRoleDeleted(ctx, cmd.ID, cmd.GuildID)
}

func (s *GuildRoleService) CreateUserAssoc(ctx context.Context, cmd *command.CreateGuildRoleUserAssociationCommand) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, cmd.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	if err := s.guildRoleRepository.AssociateUser(ctx, cmd.RoleID, cmd.UserID); err != nil {
		return err
	}

	return s.eventService.UserRoleAssociated(ctx, cmd.UserID, cmd.RoleID)
}

func (s *GuildRoleService) DeleteUserAssoc(ctx context.Context, cmd *command.DeleteGuildRoleUserAssociationCommand) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, cmd.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	if err := s.guildRoleRepository.DisassociateUser(ctx, cmd.RoleID, cmd.UserID); err != nil {
		return err
	}

	return s.eventService.UserRoleDisassociated(ctx, cmd.UserID, cmd.RoleID)
}

func (s *GuildRoleService) CreateChannelAssoc(ctx context.Context, cmd *command.CreateGuildRoleChannelAssociationCommand) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, cmd.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	if err := s.guildRoleRepository.AssociateChannel(ctx, cmd.RoleID, cmd.ChannelID); err != nil {
		return err
	}

	return s.eventService.ChannelRoleAssociated(ctx, cmd.ChannelID, cmd.GuildID, cmd.RoleID)
}

func (s *GuildRoleService) DeleteChannelAssoc(ctx context.Context, cmd *command.DeleteGuildRoleChannelAssociationCommand) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, cmd.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	if err := s.guildRoleRepository.DisassociateChannel(ctx, cmd.RoleID, cmd.ChannelID); err != nil {
		return err
	}

	return s.eventService.ChannelRoleDisassociated(ctx, cmd.ChannelID, cmd.GuildID, cmd.RoleID)
}
