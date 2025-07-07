package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToGuildResponse(guild *common.GuildResult) *response.GuildResponse {
	if guild == nil {
		return nil
	}
	return &response.GuildResponse{
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
		Channels:        ToChannelsResponse(guild.Channels),
		Roles:           ToGuildRolesResponse(guild.Roles),
	}
}

func ToGuildsResponse(guilds []*common.GuildResult) []*response.GuildResponse {
	guildResponses := make([]*response.GuildResponse, len(guilds))

	for i := 0; i < len(guilds); i++ {
		guildResponses[i] = ToGuildResponse(guilds[i])
	}

	return guildResponses
}
