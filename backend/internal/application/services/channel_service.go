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

type ChannelService struct {
	transactor          *db.Transactor
	channelRepository   *db.ChannelRepository
	guildRoleRepository *db.GuildRoleRepository
}

func CreateChannelService(channelRepository *db.ChannelRepository, guildRoleRepository *db.GuildRoleRepository) interfaces.ChannelService {
	return &ChannelService{
		channelRepository:   channelRepository,
		guildRoleRepository: guildRoleRepository,
	}
}

func (s *ChannelService) GetByID(ctx context.Context, ID string) (*query.ChannelQueryResult, error) {
	channel, err := s.channelRepository.GetByID(ctx, ID)
	if err != nil {
		return nil, err
	}

	if channel.IsGuildChannel() {
		users, err := s.channelRepository.GetUsersByChannelID(ctx, channel.ID)
		if err != nil {
			return nil, err
		}
		return &query.ChannelQueryResult{
			Result: mapper.NewUserChannelResultFromChannel(channel, users),
		}, nil
	}

	roleIDs, err := s.guildRoleRepository.GetRoleIDsByChannelID(ctx, channel.ID)
	if err != nil {
		return nil, err
	}

	return &query.ChannelQueryResult{
		Result: mapper.NewGuildChannelResultFromChannel(channel, roleIDs),
	}, nil
}

func (s *ChannelService) GetByGuildID(ctx context.Context, guildID string) (*query.ChannelQueryListResult, error) {
	channels, channelIDs, err := s.channelRepository.GetByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	roleIDs, err := s.guildRoleRepository.GetRoleIDsByChannelIDs(ctx, channelIDs)
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

	users, err := s.channelRepository.GetUsersByChannelIDs(ctx, channelIDs)
	if err != nil {
		return nil, err
	}

	return &query.ChannelQueryListResult{
		Result: mapper.NewUserChannelListResultFromChannel(channels, users),
	}, nil
}

func (s *ChannelService) Create(ctx context.Context, cmd *command.CreateChannelCommand) error {
	return s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		channel, err := entities.NewChannel(cmd.ChannelType, *cmd.GuildID, *cmd.CreatorID, *cmd.Name, cmd.Topic)
		if err != nil {
			return err
		}

		if err := s.channelRepository.Create(ctx, channel); err != nil {
			return err
		}

		if channel.IsGuildChannel() {
			for _, roleID := range *cmd.Roles {
				if err := s.guildRoleRepository.AssociateChannel(ctx, roleID, channel.ID); err != nil {
					return err
				}
			}
		} else {
			for _, userID := range *cmd.Users {
				if err := s.channelRepository.AssociateUser(ctx, userID, channel.ID); err != nil {
					return err
				}
			}
		}

		return nil
	})
}
func (s *ChannelService) Update(ctx context.Context, cmd *command.UpdateChannelCommand) error {
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

	return s.channelRepository.Update(ctx, channel)
}

func (s *ChannelService) Delete(ctx context.Context, ID string) error {
	return s.channelRepository.Delete(ctx, ID)
}
