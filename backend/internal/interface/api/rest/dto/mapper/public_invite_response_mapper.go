package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToPublicInviteResponse(guildInvite *common.PublicInviteResult) *response.PublicInviteResponse {
	if guildInvite == nil {
		return nil
	}
	return &response.PublicInviteResponse{
		ID:           guildInvite.ID,
		GuildID:      guildInvite.GuildID,
		Name:         guildInvite.Name,
		Description:  guildInvite.Description,
		ChannelCount: guildInvite.ChannelCount,
		MemberCount:  guildInvite.MemberCount,
		Icon:         guildInvite.IconID,
		Banner:       guildInvite.BannerID,
		CreatedAt:    guildInvite.CreatedAt.Unix(),
		ExpiresAt:    guildInvite.ExpiresAt.Unix(),
	}
}

func ToPublicInvitesResponse(guildInvites []*common.PublicInviteResult) []*response.PublicInviteResponse {
	publicInvitesResponse := make([]*response.PublicInviteResponse, len(guildInvites))

	for i := 0; i < len(guildInvites); i++ {
		publicInvitesResponse[i] = ToPublicInviteResponse(guildInvites[i])
	}

	return publicInvitesResponse
}
