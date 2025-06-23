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

type ChannelService struct {
	transactor           *db.Transactor
	authorisationService interfaces.AuthorisationService
	channelRepository    repositories.ChannelRepository
	guildRoleRepository  repositories.GuildRoleRepository
	userRepository       repositories.UserRepository
}

func CreateChannelService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, channelRepository repositories.ChannelRepository, guildRoleRepository repositories.GuildRoleRepository, userRepository repositories.UserRepository) interfaces.ChannelService {
	return &ChannelService{
		transactor:           transactor,
		authorisationService: authorisationService,
		channelRepository:    channelRepository,
		guildRoleRepository:  guildRoleRepository,
		userRepository:       userRepository,
	}
}

func (s *ChannelService) GetByGuildID(ctx context.Context, guildID string, requestorID string) (*query.ChannelQueryListResult, error) {
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
		Result: mapper.NewGuildChannelListResultFromChannel(channels, roleIDs),
	}, nil
}

func (s *ChannelService) GetByUserID(ctx context.Context, userID string) (*query.ChannelQueryListResult, error) {

	channels, channelIDs, err := s.channelRepository.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	users, err := s.channelRepository.GetMapUsersByChannelIDs(ctx, channelIDs)
	if err != nil {
		return nil, err
	}

	return &query.ChannelQueryListResult{
		Result: mapper.NewUserChannelListResultFromChannel(channels, users),
	}, nil
}

func (s *ChannelService) createGuildChannel(ctx context.Context, channel *entities.Channel, roleIDs *[]string, requestorID string) error {
	return s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		err := s.authorisationService.VerifyUserGuildPermission(ctx, *channel.GuildID, requestorID, constants.MANAGE_GUILD_CHANNELS_PERMISSION)
		if err != nil {
			return err
		}

		var rolesToAssign []*entities.GuildRole

		if roleIDs != nil && len(*roleIDs) != 0 {
			roles, err := s.guildRoleRepository.GetByIDs(ctx, *roleIDs, *channel.GuildID)
			if err != nil {
				return err
			}

			if len(roles) != len(*roleIDs) {
				return db.ErrNotFound
			}

			rolesToAssign = append(rolesToAssign, roles...)
		}

		role, err := s.guildRoleRepository.GetByNameAndGuildID(ctx, "@owner", *channel.GuildID)
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

func (s *ChannelService) createUserChannel(ctx context.Context, channel *entities.Channel, userIDs *[]string, requestorID string) error {
	return s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		if err := s.authorisationService.VerifyFriendRelationships(ctx, requestorID, *userIDs); err != nil {
			return err
		}

		users, err := s.userRepository.GetByIDs(ctx, *userIDs)
		if err != nil {
			return err
		}

		if len(users) != len(*userIDs) {
			return db.ErrNotFound
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

func (s *ChannelService) Create(ctx context.Context, cmd *command.CreateChannelCommand, requestorID string) error {
	channel, err := entities.NewChannel(cmd.ChannelType, cmd.GuildID, cmd.CreatorID, *cmd.Name, cmd.Topic)
	if err != nil {
		return err
	}

	if channel.IsGuildChannel() {
		return s.createGuildChannel(ctx, channel, cmd.RoleIDs, requestorID)
	}

	return s.createUserChannel(ctx, channel, cmd.UserIDs, requestorID)
}

func (s *ChannelService) Update(ctx context.Context, cmd *command.UpdateChannelCommand, requestorID string) error {
	err := s.authorisationService.VerifyUserChannelPermission(ctx, cmd.ID, requestorID, constants.MANAGE_GUILD_CHANNELS_PERMISSION)
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

	return nil
}

func (s *ChannelService) Delete(ctx context.Context, ID string, requestorID string) error {
	err := s.authorisationService.VerifyUserChannelPermission(ctx, ID, requestorID, constants.MANAGE_GUILD_CHANNELS_PERMISSION)
	if err != nil {
		return err
	}

	if err := s.channelRepository.Delete(ctx, ID); err != nil {
		return err
	}

	return nil
}

func (s *ChannelService) AssociateUser(ctx context.Context, channelID, userID string, requestorID string) error {
	err := s.authorisationService.VerifyUserChannelPermission(ctx, channelID, requestorID, 0)
	if err != nil {
		return err
	}

	if err := s.authorisationService.VerifyFriendRelationships(ctx, requestorID, []string{userID}); err != nil {
		return err
	}

	if err := s.channelRepository.AssociateUser(ctx, channelID, userID); err != nil {
		return err
	}

	return nil
}

func (s *ChannelService) DisassociateUser(ctx context.Context, channelID, userID string, requestorID string) error {
	err := s.authorisationService.VerifyUserChannelPermission(ctx, channelID, requestorID, 0)
	if err != nil {
		return err
	}

	if err := s.channelRepository.DisassociateUser(ctx, channelID, userID); err != nil {
		return err
	}

	return nil
}
