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
		ID:           guildInvite.ID,
		GuildID:      guildInvite.GuildID,
		Name:         guildInvite.Name,
		Description:  guildInvite.Description,
		ChannelCount: guildInvite.ChannelCount,
		MemberCount:  guildInvite.MemberCount,
		Icon:         guildInvite.IconID,
		Banner:       guildInvite.BannerID,
		CreatedAt:    guildInvite.CreatedAt,
	}
}

func ToGuildInvitesResponse(guildInvites []*common.GuildInviteResult) []*response.GuildInviteResponse {
	guildInvitesResponse := make([]*response.GuildInviteResponse, len(guildInvites))

	for i := 0; i < len(guildInvites); i++ {
		guildInvitesResponse[i] = ToGuildInviteResponse(guildInvites[i])
	}

	return guildInvitesResponse
}
