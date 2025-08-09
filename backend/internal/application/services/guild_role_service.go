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
	channelRepository     repositories.ChannelRepository
	userRepository        repositories.UserRepository
}

func CreateGuildRoleService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, eventService interfaces.EventService, guildRoleRepository repositories.GuildRoleRepository, guildMemberRepository repositories.GuildMemberRepository, channelRepository repositories.ChannelRepository, userRepository repositories.UserRepository) interfaces.GuildRoleService {
	return &GuildRoleService{
		transactor:            transactor,
		authorisationService:  authorisationService,
		eventService:          eventService,
		guildRoleRepository:   guildRoleRepository,
		guildMemberRepository: guildMemberRepository,
		channelRepository:     channelRepository,
		userRepository:        userRepository,
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

	guildRoleEntity, err := entities.NewGuildRole(cmd.GuildID)
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

	return s.transactor.WithinTransaction(ctx, func(context.Context) error {
		if err := s.guildRoleRepository.BulkAssociateUser(ctx, cmd.RoleID, cmd.UserIDs); err != nil {
			return err
		}

		for _, userID := range cmd.UserIDs {
			if err := s.eventService.UserRoleAssociated(ctx, userID, cmd.RoleID); err != nil {
				return err
			}
		}

		return nil
	})
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

	channel, err := s.channelRepository.GetByIDAndGuildID(ctx, cmd.ChannelID, cmd.GuildID)
	if err != nil {
		return err
	}

	if !channel.IsGuildCategoryChannel() {
		if err := s.guildRoleRepository.AssociateChannel(ctx, cmd.RoleID, cmd.ChannelID); err != nil {
			return err
		}

		return s.eventService.ChannelRoleAssociated(ctx, cmd.ChannelID, cmd.GuildID, cmd.RoleID)
	}

	ids, err := s.channelRepository.GetIDsSyncedWithParentByParentID(ctx, cmd.ChannelID)
	if err != nil {
		return err
	}

	return s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		channelIDsToAssociate := append(ids, cmd.ChannelID)
		if err := s.guildRoleRepository.BulkChannelAssociateRole(ctx, cmd.RoleID, channelIDsToAssociate); err != nil {
			return err
		}

		for _, channelID := range channelIDsToAssociate {
			if err := s.eventService.ChannelRoleAssociated(ctx, channelID, cmd.GuildID, cmd.RoleID); err != nil {
				return err
			}
		}

		return nil
	})
}

func (s *GuildRoleService) SyncGuildChannelRoleAssociations(ctx context.Context, cmd *command.SyncGuildRoleChannelAssociationsCommand) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, cmd.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	sourceChannel, err := s.channelRepository.GetByIDAndGuildID(ctx, cmd.SourceChannelID, cmd.GuildID)
	if err != nil {
		return err
	}

	if !sourceChannel.IsGuildCategoryChannel() {
		return ErrInvalidChannelType
	}

	_, err = s.channelRepository.GetByIDAndGuildIDAndParentID(ctx, cmd.TargetChannelID, cmd.GuildID, sourceChannel.ID)
	if err != nil {
		return err
	}

	return s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {

		if err := s.guildRoleRepository.WipeChannelAssociations(ctx, cmd.SourceChannelID); err != nil {
			return err
		}

		roleIDs, err := s.guildRoleRepository.GetRoleIDsByChannelID(ctx, cmd.TargetChannelID)
		if err != nil {
			return err
		}

		if err := s.guildRoleRepository.BulkRoleAssociateChannel(ctx, cmd.SourceChannelID, roleIDs); err != nil {
			return err
		}

		return s.eventService.ChannelRolesSet(ctx, cmd.SourceChannelID, cmd.GuildID, roleIDs)
	})
}

func (s *GuildRoleService) DeleteChannelAssoc(ctx context.Context, cmd *command.DeleteGuildRoleChannelAssociationCommand) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, cmd.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	channel, err := s.channelRepository.GetByIDAndGuildID(ctx, cmd.ChannelID, cmd.GuildID)
	if err != nil {
		return err
	}

	if !channel.IsGuildCategoryChannel() {
		if err := s.guildRoleRepository.DisassociateChannel(ctx, cmd.RoleID, cmd.ChannelID); err != nil {
			return err
		}

		return s.eventService.ChannelRoleDisassociated(ctx, cmd.ChannelID, cmd.GuildID, cmd.RoleID)
	}

	ids, err := s.channelRepository.GetIDsSyncedWithParentByParentID(ctx, cmd.ChannelID)
	if err != nil {
		return err
	}

	return s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		channelIDsToDisassociate := append(ids, cmd.ChannelID)
		if err := s.guildRoleRepository.BulkChannelDisassociateRole(ctx, cmd.RoleID, channelIDsToDisassociate); err != nil {
			return err
		}

		for _, channelID := range channelIDsToDisassociate {
			if err := s.eventService.ChannelRoleDisassociated(ctx, channelID, cmd.GuildID, cmd.RoleID); err != nil {
				return err
			}
		}

		return nil
	})

}

func (s *GuildRoleService) GetAssignedGuildMembersByRoleID(ctx context.Context, qry *query.GuildRoleMembersQuery) (*query.GuildMemberQueryListResult, error) {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, qry.GuildID, qry.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return nil, err
	}

	guildMembers, guildMemberIDs, err := s.guildMemberRepository.GetAssignedByGuildIDAndRoleID(ctx, qry.GuildID, qry.RoleID, qry.Before, 50)
	if err != nil {
		return nil, err
	}

	usersMap, err := s.userRepository.GetMapByIDs(ctx, guildMemberIDs)
	if err != nil {
		return nil, err
	}

	guildMembersRolesMap, err := s.guildRoleRepository.GetMapRoleIDsByUserIDs(ctx, guildMemberIDs)
	if err != nil {
		return nil, err
	}

	return &query.GuildMemberQueryListResult{
		Result: mapper.NewGuildMemberUserListResultFromGuildMember(guildMembers, guildMembersRolesMap, usersMap),
	}, nil
}

func (s *GuildRoleService) GetUnassignedGuildMembersByRoleID(ctx context.Context, qry *query.GuildRoleMembersQuery) (*query.GuildMemberQueryListResult, error) {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, qry.GuildID, qry.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return nil, err
	}

	guildMembers, guildMemberIDs, err := s.guildMemberRepository.GetUnassignedByGuildIDAndRoleID(ctx, qry.GuildID, qry.RoleID, qry.Before, 50)
	if err != nil {
		return nil, err
	}

	usersMap, err := s.userRepository.GetMapByIDs(ctx, guildMemberIDs)
	if err != nil {
		return nil, err
	}

	guildMembersRolesMap, err := s.guildRoleRepository.GetMapRoleIDsByUserIDs(ctx, guildMemberIDs)
	if err != nil {
		return nil, err
	}

	return &query.GuildMemberQueryListResult{
		Result: mapper.NewGuildMemberUserListResultFromGuildMember(guildMembers, guildMembersRolesMap, usersMap),
	}, nil
}
