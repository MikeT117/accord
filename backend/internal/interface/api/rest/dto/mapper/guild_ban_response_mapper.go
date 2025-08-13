package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToGuildBanResponse(guildBan *common.GuildBanResult) *response.GuildBanResponse {
	if guildBan == nil {
		return nil
	}

	return &response.GuildBanResponse{
		Avatar:      guildBan.Avatar,
		Banner:      guildBan.Banner,
		Username:    guildBan.Username,
		DisplayName: guildBan.DisplayName,
		UserID:      guildBan.UserID,
		GuildID:     guildBan.GuildID,
		Reason:      guildBan.Reason,
		CreatedAt:   guildBan.CreatedAt.Unix(),
		UpdatedAt:   guildBan.UpdatedAt.Unix(),
	}
}

func ToGuildBansResponse(guildBan []*common.GuildBanResult) []*response.GuildBanResponse {
	guildBansResponse := make([]*response.GuildBanResponse, len(guildBan))

	for i := 0; i < len(guildBan); i++ {
		guildBansResponse[i] = ToGuildBanResponse(guildBan[i])
	}

	return guildBansResponse
}
