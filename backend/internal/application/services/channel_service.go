package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/MikeT117/accord/backend/internal/constants"
	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/MikeT117/accord/backend/internal/infra/db"
	"github.com/google/uuid"
)

type ChannelService struct {
	transactor           *db.Transactor
	authorisationService interfaces.AuthorisationService
	eventService         interfaces.EventService
	channelRepository    repositories.ChannelRepository
	guildRepository      repositories.GuildRepository
	guildRoleRepository  repositories.GuildRoleRepository
	userRepository       repositories.UserRepository
}

func CreateChannelService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, eventService interfaces.EventService, channelRepository repositories.ChannelRepository, guildRepository repositories.GuildRepository, guildRoleRepository repositories.GuildRoleRepository, userRepository repositories.UserRepository) interfaces.ChannelService {
	return &ChannelService{
		transactor:           transactor,
		authorisationService: authorisationService,
		eventService:         eventService,
		channelRepository:    channelRepository,
		guildRepository:      guildRepository,
		guildRoleRepository:  guildRoleRepository,
		userRepository:       userRepository,
	}
}

func (s *ChannelService) GetByGuildID(ctx context.Context, guildID uuid.UUID, requestorID uuid.UUID) (*query.ChannelQueryListResult, error) {
	err := s.authorisationService.VerifyGuildMember(ctx, guildID, requestorID)
	if err != nil {
		return nil, err
	}

	channels, channelIDs, err := s.channelRepository.GetByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	roleIDs, err := s.guildRoleRepository.GetMapRoleIDsByChannelIDs(ctx, channelIDs)
	if err != nil {
		return nil, err
	}

	return &query.ChannelQueryListResult{
		Result: mapper.NewChannelListResultFromChannel(channels, roleIDs, nil),
	}, nil
}

func (s *ChannelService) GetByUserID(ctx context.Context, userID uuid.UUID) (*query.ChannelQueryListResult, error) {

	channels, channelIDs, err := s.channelRepository.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	users, err := s.channelRepository.GetMapUsersByChannelIDs(ctx, channelIDs)
	if err != nil {
		return nil, err
	}

	return &query.ChannelQueryListResult{
		Result: mapper.NewChannelListResultFromChannel(channels, nil, users),
	}, nil
}

func (s *ChannelService) Create(ctx context.Context, cmd *command.CreateChannelCommand) error {
	channel, err := entities.NewChannel(cmd.ChannelType, cmd.GuildID, cmd.CreatorID, *cmd.Name, cmd.Topic)
	if err != nil {
		return err
	}

	if !channel.IsGuildChannel() {
		if err := s.createUserChannel(ctx, channel, cmd.UserIDs, cmd.CreatorID); err != nil {
			return err
		}

		return s.eventService.ChannelCreated(ctx, channel.ID)
	}

	if err := s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		guild, err := s.guildRepository.GetByID(ctx, *channel.GuildID)
		if err != nil {
			return err
		}

		guild.IncrementChannelCount()

		if err := s.guildRepository.Update(ctx, guild); err != nil {
			return err
		}

		if err := s.createGuildChannel(ctx, channel, cmd.IsPrivate, cmd.RoleIDs, cmd.CreatorID); err != nil {
			return err
		}

		return nil

	}); err != nil {
		return err
	}

	if err := s.eventService.GuildUpdated(ctx, *cmd.GuildID); err != nil {
		return err
	}

	return s.eventService.ChannelCreated(ctx, channel.ID)
}

func (s *ChannelService) Update(ctx context.Context, cmd *command.UpdateChannelCommand) error {
	err := s.authorisationService.VerifyGuildChannelPermission(ctx, cmd.ID, cmd.RequestorID, constants.MANAGE_GUILD_CHANNELS_PERMISSION)
	if err != nil {
		return err
	}

	channel, err := s.channelRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if err := channel.UpdateName(cmd.Name); err != nil {
		return err
	}
	if err := channel.UpdateParentID(cmd.ParentID); err != nil {
		return err
	}
	if err := channel.UpdateTopic(cmd.Topic); err != nil {
		return err
	}

	if err := s.channelRepository.Update(ctx, channel); err != nil {
		return err
	}

	return s.eventService.ChannelUpdated(ctx, channel.ID)
}

func (s *ChannelService) Delete(ctx context.Context, cmd *command.DeleteChannelCommand) error {
	err := s.authorisationService.VerifyGuildChannelPermission(ctx, cmd.ID, cmd.RequestorID, constants.MANAGE_GUILD_CHANNELS_PERMISSION)
	if err != nil {
		return err
	}

	channel, err := s.channelRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	var userIDs []uuid.UUID
	if !channel.IsGuildChannel() {
		userIDs, err = s.channelRepository.GetUserIDsByChannelID(ctx, channel.ID)
		if err != nil {
			return err
		}

	}

	if err := s.channelRepository.Delete(ctx, cmd.ID); err != nil {
		return err
	}

	if channel.IsGuildChannel() {
		return s.eventService.ChannelDeleted(ctx, channel.ID, channel.GuildID, nil)
	}

	return s.eventService.ChannelDeleted(ctx, channel.ID, nil, userIDs)

}

func (s *ChannelService) CreateUserAssoc(ctx context.Context, cmd *command.CreateUserChannelAssociationCommand) error {
	err := s.authorisationService.VerifyPrivateChannelMember(ctx, cmd.ChannelID, cmd.RequestorID)
	if err != nil {
		return err
	}

	if err := s.authorisationService.VerifyRelationships(ctx, cmd.RequestorID, []uuid.UUID{cmd.UserID}, false, true, false); err != nil {
		return err
	}

	if err := s.channelRepository.AssociateUser(ctx, cmd.ChannelID, cmd.UserID); err != nil {
		return err
	}

	return nil
}

func (s *ChannelService) DeleteUserAssoc(ctx context.Context, cmd *command.DeleteUserChannelAssociationCommand) error {
	err := s.authorisationService.VerifyPrivateChannelMember(ctx, cmd.ChannelID, cmd.RequestorID)
	if err != nil {
		return err
	}

	if err := s.channelRepository.DisassociateUser(ctx, cmd.ChannelID, cmd.UserID); err != nil {
		return err
	}

	return nil
}

func (s *ChannelService) createGuildChannel(ctx context.Context, channel *entities.Channel, isPrivate bool, roleIDs []uuid.UUID, requestorID uuid.UUID) error {
	return s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		err := s.authorisationService.VerifyUserGuildPermission(ctx, *channel.GuildID, requestorID, constants.MANAGE_GUILD_CHANNELS_PERMISSION)
		if err != nil {
			return err
		}

		var rolesToAssign []*entities.GuildRole

		if len(roleIDs) != 0 {
			roles, err := s.guildRoleRepository.GetByIDs(ctx, roleIDs, *channel.GuildID)
			if err != nil {
				return err
			}

			if len(roles) != len(roleIDs) {
				return domain.ErrEntityNotFound
			}

			rolesToAssign = append(rolesToAssign, roles...)
		}

		if !isPrivate {
			role, err := s.guildRoleRepository.GetByNameAndGuildID(ctx, entities.DefaultRootRoleName, *channel.GuildID)
			if err != nil {
				return err
			}

			rolesToAssign = append(rolesToAssign, role)
		}

		role, err := s.guildRoleRepository.GetByNameAndGuildID(ctx, entities.OwnerRootRoleName, *channel.GuildID)
		if err != nil {
			return err
		}

		rolesToAssign = append(rolesToAssign, role)

		if err := s.channelRepository.Create(ctx, channel); err != nil {
			return err
		}

		for _, role := range rolesToAssign {
			if err := s.guildRoleRepository.AssociateChannel(ctx, role.ID, channel.ID); err != nil {
				return err
			}
		}

		return nil
	})
}

func (s *ChannelService) createUserChannel(ctx context.Context, channel *entities.Channel, userIDs []uuid.UUID, requestorID uuid.UUID) error {
	return s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		if err := s.authorisationService.VerifyRelationships(ctx, requestorID, userIDs, false, true, false); err != nil {
			return err
		}

		users, err := s.userRepository.GetByIDs(ctx, userIDs)
		if err != nil {
			return err
		}

		if len(users) != len(userIDs) {
			return domain.ErrEntityNotFound
		}

		if err := s.channelRepository.Create(ctx, channel); err != nil {
			return err
		}

		for _, user := range users {
			if err := s.channelRepository.AssociateUser(ctx, user.ID, channel.ID); err != nil {
				return err
			}
		}

		return nil
	})
}
