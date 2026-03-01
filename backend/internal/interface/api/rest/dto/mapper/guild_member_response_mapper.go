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
		ID:          guildMember.ID,
		DisplayName: guildMember.DisplayName,
		Username:    guildMember.Username,
		Avatar:      guildMember.AvatarID,
		Banner:      guildMember.BannerID,
		GuildID:     guildMember.GuildID,
		CreatedAt:   guildMember.CreatedAt.Unix(),
		UpdatedAt:   guildMember.UpdatedAt.Unix(),
		RoleIDs:     guildMember.RoleIDs,
	}

}

func ToGuildMembersResponse(guildMembers []*common.GuildMemberResult) []*response.GuildMemberResponse {
	guildMembersResponses := make([]*response.GuildMemberResponse, len(guildMembers))

	for i := 0; i < len(guildMembers); i++ {
		guildMembersResponses[i] = ToGuildMemberResponse(guildMembers[i])
	}

	return guildMembersResponses
}
