package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func NewGuildInviteResultFromGuildInvite(guildInvite *entities.GuildInvite, guild *entities.Guild) *common.GuildInviteResult {
	return &common.GuildInviteResult{
		ID:           guildInvite.ID,
		UsedCount:    guildInvite.UsedCount,
		GuildID:      guildInvite.GuildID,
		CreatedAt:    guildInvite.CreatedAt,
		UpdatedAt:    guildInvite.UpdatedAt,
		ExpiresAt:    guildInvite.ExpiresAt,
		Name:         guild.Name,
		Description:  guild.Description,
		ChannelCount: guild.ChannelCount,
		MemberCount:  guild.MemberCount,
		IconID:       guild.IconID,
		BannerID:     guild.BannerID,
	}
}

func NewGuildInviteListResultFromGuildInvite(guildInvites []*entities.GuildInvite, guild *entities.Guild) []*common.GuildInviteResult {

	guildInvitesResult := make([]*common.GuildInviteResult, len(guildInvites))

	for i := 0; i < len(guildInvites); i++ {
		guildInvitesResult[i] = NewGuildInviteResultFromGuildInvite(guildInvites[i], guild)
	}

	return guildInvitesResult
}
