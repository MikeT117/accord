package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func NewGuildBanResultFromGuildBan(guildBan *entities.GuildBan) *common.GuildBanResult {
	return &common.GuildBanResult{
		UserID:    guildBan.UserID,
		GuildID:   guildBan.GuildID,
		Reason:    guildBan.Reason,
		CreatedAt: guildBan.CreatedAt,
		UpdatedAt: guildBan.UpdatedAt,
	}
}

func NewGuildBanListResultFromGuildBan(guildBans []*entities.GuildBan) []*common.GuildBanResult {
	guildBanResults := make([]*common.GuildBanResult, len(guildBans))

	for i := 0; i < len(guildBanResults); i++ {
		guildBanResults[i] = NewGuildBanResultFromGuildBan(guildBans[i])
	}

	return guildBanResults
}
