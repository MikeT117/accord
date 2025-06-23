package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func NewUserChannelResultFromChannel(channel *entities.Channel, users []*entities.User) *common.ChannelResult {
	tempUsers := make([]*common.UserResult, len(users))

	if len(tempUsers) != 0 {
		for i := 0; i < len(users); i++ {
			tempUsers[i] = NewUserResultFromUser(users[i])
		}
	}

	return &common.ChannelResult{
		ID:          channel.ID,
		CreatorID:   channel.CreatorID,
		GuildID:     channel.GuildID,
		ParentID:    channel.ParentID,
		Name:        channel.Name,
		Topic:       channel.Topic,
		ChannelType: channel.ChannelType,
		CreatedAt:   channel.CreatedAt,
		UpdatedAt:   channel.UpdatedAt,
		Users:       tempUsers,
	}
}

func NewGuildChannelResultFromChannel(channel *entities.Channel, roleIDs []string) *common.ChannelResult {
	return &common.ChannelResult{
		ID:          channel.ID,
		CreatorID:   channel.CreatorID,
		GuildID:     channel.GuildID,
		ParentID:    channel.ParentID,
		Name:        channel.Name,
		Topic:       channel.Topic,
		ChannelType: channel.ChannelType,
		CreatedAt:   channel.CreatedAt,
		UpdatedAt:   channel.UpdatedAt,
		RoleIDs:     roleIDs,
	}
}

func NewGuildChannelListResultFromChannel(channels []*entities.Channel, roleIDs map[string][]string) []*common.ChannelResult {
	tempChannels := make([]*common.ChannelResult, len(channels))

	for i := 0; i < len(channels); i++ {
		tempChannels = append(tempChannels, NewGuildChannelResultFromChannel(channels[i], roleIDs[channels[i].ID]))
	}

	return tempChannels
}

func NewUserChannelListResultFromChannel(channels []*entities.Channel, userIDs map[string][]*entities.User) []*common.ChannelResult {
	tempChannels := make([]*common.ChannelResult, len(channels))

	for i := 0; i < len(channels); i++ {
		tempChannels = append(tempChannels, NewUserChannelResultFromChannel(channels[i], userIDs[channels[i].ID]))
	}

	return tempChannels
}
