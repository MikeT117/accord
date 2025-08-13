package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

func NewGuildBanResult(guildBan *entities.GuildBan, guildMember *entities.GuildMember, user *entities.User) *common.GuildBanResult {
	guildBanResult := &common.GuildBanResult{
		Avatar:      user.AvatarID,
		Banner:      user.BannerID,
		Username:    user.Username,
		DisplayName: user.DisplayName,
		UserID:      guildBan.UserID,
		GuildID:     guildBan.GuildID,
		Reason:      guildBan.Reason,
		CreatedAt:   guildBan.CreatedAt,
		UpdatedAt:   guildBan.UpdatedAt,
	}

	if guildMember.AvatarID != nil {
		guildBanResult.Avatar = guildMember.AvatarID
	}
	if guildMember.BannerID != nil {
		guildBanResult.Banner = guildMember.BannerID
	}
	if guildMember.Nickname != nil {
		guildBanResult.DisplayName = *guildMember.Nickname
	}

	return guildBanResult
}

func NewGuildBanListResult(guildBans []*entities.GuildBan, guildMembers map[uuid.UUID]*entities.GuildMember, users map[uuid.UUID]*entities.User) []*common.GuildBanResult {
	guildBanResults := make([]*common.GuildBanResult, len(guildBans))

	for i := 0; i < len(guildBanResults); i++ {
		guildBanResults[i] = NewGuildBanResult(guildBans[i], guildMembers[guildBans[i].UserID], users[guildBans[i].UserID])
	}

	return guildBanResults
}
