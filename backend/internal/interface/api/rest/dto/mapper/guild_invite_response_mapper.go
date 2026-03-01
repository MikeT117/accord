package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToGuildInviteResponse(guildInvite *common.GuildInviteResult) *response.GuildInviteResponse {
	if guildInvite == nil {
		return nil
	}
	return &response.GuildInviteResponse{
		ID:          guildInvite.ID,
		CreatedAt:   guildInvite.CreatedAt.Unix(),
		ExpiresAt:   guildInvite.ExpiresAt.Unix(),
		UsedCount:   guildInvite.UsedCount,
		CreatorId:   guildInvite.CreatorID,
		DisplayName: guildInvite.DisplayName,
		Username:    guildInvite.Username,
		Avatar:      guildInvite.Avatar,
	}
}

func ToGuildInvitesResponse(guildInvites []*common.GuildInviteResult) []*response.GuildInviteResponse {
	guildInvitesResponse := make([]*response.GuildInviteResponse, len(guildInvites))

	for i := 0; i < len(guildInvites); i++ {
		guildInvitesResponse[i] = ToGuildInviteResponse(guildInvites[i])
	}

	return guildInvitesResponse
}
