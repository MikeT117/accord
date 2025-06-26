package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToGuildMemberResponse(guildMember *common.GuildMemberResult) *response.GuildMemberResponse {
	if guildMember == nil {
		return nil
	}

	return &response.GuildMemberResponse{
		GuildID:   guildMember.GuildID,
		Nickname:  guildMember.Nickname,
		CreatedAt: guildMember.CreatedAt,
		UpdatedAt: guildMember.UpdatedAt,
		Avatar:    guildMember.AvatarID,
		Banner:    guildMember.BannerID,
		Roles:     guildMember.Roles,
	}

}

func ToGuildMembersResponse(guildMembers []*common.GuildMemberResult) []*response.GuildMemberResponse {
	guildMembersResponses := make([]*response.GuildMemberResponse, len(guildMembers))

	for i := 0; i < len(guildMembers); i++ {
		guildMembersResponses[i] = ToGuildMemberResponse(guildMembers[i])
	}

	return guildMembersResponses
}
