package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToDiscoverableGuildResponse(guild *common.GuildResult) *response.DiscoverableGuildResponse {
	if guild == nil {
		return nil
	}

	return &response.DiscoverableGuildResponse{
		ID:              guild.ID,
		CreatorID:       guild.CreatorID,
		GuildCategoryID: guild.GuildCategoryID,
		Name:            guild.Name,
		Description:     guild.Description,
		Discoverable:    guild.Discoverable,
		ChannelCount:    guild.ChannelCount,
		MemberCount:     guild.MemberCount,
		CreatedAt:       guild.CreatedAt.Unix(),
		UpdatedAt:       guild.UpdatedAt.Unix(),
		Icon:            guild.IconID,
		Banner:          guild.BannerID,
	}
}

func ToDiscoverableGuildsResponse(guilds []*common.GuildResult) []*response.DiscoverableGuildResponse {
	guildResponses := make([]*response.DiscoverableGuildResponse, len(guilds))

	for i := 0; i < len(guilds); i++ {
		guildResponses[i] = ToDiscoverableGuildResponse(guilds[i])
	}

	return guildResponses
}
