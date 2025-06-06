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
	repositories *db.MasterRepository
}

func CreateChannelService(repositories *db.MasterRepository) interfaces.ChannelService {
	return &ChannelService{
		repositories: repositories,
	}
}

func (s *ChannelService) GetByID(ctx context.Context, ID string) (*query.ChannelQueryResult, error) {
	channel, err := s.repositories.ChannelRepository.GetByID(ctx, ID)
	if err != nil {
		return nil, err
	}

	if channel.IsGuildChannel() {
		users, err := s.repositories.ChannelUserRepository.GetByChannelID(ctx, channel.ID)
		if err != nil {
			return nil, err
		}
		return &query.ChannelQueryResult{
			Result: mapper.NewUserChannelResultFromChannel(channel, users),
		}, nil
	}

	roleIDs, err := s.repositories.GuildRoleChannelRepository.GetRoleIDsByChannelID(ctx, channel.ID)

	return &query.ChannelQueryResult{
		Result: mapper.NewGuildChannelResultFromChannel(channel, roleIDs),
	}, nil
}

func (s *ChannelService) GetByGuildID(ctx context.Context, guildID string) (*query.ChannelQueryListResult, error) {
	channels, channelIDs, err := s.repositories.ChannelRepository.GetByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	roleIDs, err := s.repositories.GuildRoleChannelRepository.GetRoleIDsByChannelIDs(ctx, channelIDs)

	return &query.ChannelQueryListResult{
		Result: mapper.NewGuildChannelListResultFromChannel(channels, roleIDs),
	}, nil
}

func (s *ChannelService) GetByUserID(ctx context.Context, userID string) (*query.ChannelQueryListResult, error) {
	channels, channelIDs, err := s.repositories.ChannelRepository.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	users, err := s.repositories.ChannelUserRepository.GetByChannelIDs(ctx, channelIDs)
	if err != nil {
		return nil, err
	}

	return &query.ChannelQueryListResult{
		Result: mapper.NewUserChannelListResultFromChannel(channels, users),
	}, nil
}

func (s *ChannelService) Create(ctx context.Context, createCommand *command.CreateChannelCommand) (*command.CreateChannelCommandResult, error) {
	channelEntity, err := entities.NewChannel(createCommand.ChannelType, *createCommand.GuildID, *createCommand.CreatorID, *createCommand.Name, createCommand.Topic)
	if err != nil {
		return nil, err
	}

	validatedChannelEntity, err := entities.NewValidatedChannel(channelEntity)
	if err != nil {
		return nil, err
	}

}
func (s *ChannelService) Update(ctx context.Context, createCommand *command.UpdateChannelCommand) (*command.CreateChannelCommandResult, error) {

}

func (s *ChannelService) Delete(ctx context.Context, ID string) error {
	return s.repositories.ChannelRepository.Delete(ctx, ID)
}
