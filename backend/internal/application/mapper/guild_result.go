package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func ExistingGuildResultFromGuild(
	guild *entities.Guild,
	channels []*entities.Channel,
	channelRoles map[string][]string,
	roles []*entities.GuildRole,
) *common.GuildResult {
	tempChannels := make([]*common.ChannelResult, len(channels))
	tempRoles := make([]*common.GuildRoleResult, len(roles))

	if len(channels) != 0 {
		for i := 0; i < len(channels); i++ {
			tempChannels[i] = NewGuildChannelResultFromChannel(
				channels[i],
				channelRoles[channels[i].ID],
			)
		}
	}

	if len(roles) != 0 {
		for i := 0; i < len(roles); i++ {
			tempRoles[i] = NewGuildRoleResultFromGuildRole(roles[i])
		}
	}

	return &common.GuildResult{
		ID:              guild.ID,
		CreatorID:       guild.CreatorID,
		GuildCategoryID: guild.GuildCategoryID,
		Name:            guild.Name,
		Description:     guild.Description,
		Discoverable:    guild.Discoverable,
		ChannelCount:    guild.ChannelCount,
		MemberCount:     guild.MemberCount,
		CreatedAt:       guild.CreatedAt,
		UpdatedAt:       guild.UpdatedAt,
		IconID:          guild.IconID,
		BannerID:        guild.BannerID,
		Roles:           tempRoles,
		Channels:        tempChannels,
	}
}

func NewGuildResultFromGuild(
	guild *entities.Guild,
	roles []*entities.GuildRole,
) *common.GuildResult {
	tempRoles := make([]*common.GuildRoleResult, len(roles))

	if len(roles) != 0 {
		for i := 0; i < len(roles); i++ {
			tempRoles[i] = NewGuildRoleResultFromGuildRole(roles[i])
		}
	}

	return &common.GuildResult{
		ID:              guild.ID,
		CreatorID:       guild.CreatorID,
		GuildCategoryID: guild.GuildCategoryID,
		Name:            guild.Name,
		Description:     guild.Description,
		Discoverable:    guild.Discoverable,
		ChannelCount:    guild.ChannelCount,
		MemberCount:     guild.MemberCount,
		CreatedAt:       guild.CreatedAt,
		UpdatedAt:       guild.UpdatedAt,
		IconID:          guild.IconID,
		BannerID:        guild.BannerID,
		Roles:           tempRoles,
		Channels:        []*common.ChannelResult{},
	}
}
