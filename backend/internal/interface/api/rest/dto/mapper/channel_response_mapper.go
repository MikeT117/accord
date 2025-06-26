package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToChannelResponse(channel *common.ChannelResult) *response.ChannelResponse {
	if channel == nil {
		return nil
	}

	response := &response.ChannelResponse{
		ID:          channel.ID,
		CreatorID:   channel.CreatorID,
		GuildID:     channel.GuildID,
		ParentID:    channel.ParentID,
		Name:        channel.Name,
		Topic:       channel.Topic,
		ChannelType: channel.ChannelType,
		CreatedAt:   channel.CreatedAt,
		UpdatedAt:   channel.UpdatedAt,
	}

	if len(channel.Users) != 0 {
		response.Users = ToUsersResponse(channel.Users)
	}

	if len(channel.RoleIDs) != 0 {
		response.Roles = channel.RoleIDs
	}

	return response
}

func ToChannelsResponse(channels []*common.ChannelResult) []*response.ChannelResponse {
	channelsResponses := make([]*response.ChannelResponse, len(channels))

	for i := 0; i < len(channels); i++ {
		channelsResponses[i] = ToChannelResponse(channels[i])
	}

	return channelsResponses
}
