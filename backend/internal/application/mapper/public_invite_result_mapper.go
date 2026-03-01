package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func NewPublicInviteResultFromGuildInvite(guildInvite *entities.GuildInvite, guild *entities.Guild) *common.PublicInviteResult {
	return &common.PublicInviteResult{
		ID:           guildInvite.ID,
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

func NewPublicInviteListResultFromGuildInvite(guildInvites []*entities.GuildInvite, guild *entities.Guild) []*common.PublicInviteResult {

	guildInvitesResult := make([]*common.PublicInviteResult, len(guildInvites))

	for i := 0; i < len(guildInvites); i++ {
		guildInvitesResult[i] = NewPublicInviteResultFromGuildInvite(guildInvites[i], guild)
	}

	return guildInvitesResult
}
