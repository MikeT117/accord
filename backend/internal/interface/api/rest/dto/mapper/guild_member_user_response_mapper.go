package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToGuildMemberUserResponse(guildMemberUser *common.GuildMemberUserResult) *response.GuildMemberUserResponse {
	if guildMemberUser == nil {
		return nil
	}

	return &response.GuildMemberUserResponse{
		GuildMember: ToGuildMemberResponse(guildMemberUser.GuildMember),
		User:        ToUserResponse(guildMemberUser.User),
	}
}

func ToGuildMemberUsersResponse(guildMemberUsers []*common.GuildMemberUserResult) []*response.GuildMemberUserResponse {
	guildMemberUsersResponses := make([]*response.GuildMemberUserResponse, len(guildMemberUsers))

	for i := 0; i < len(guildMemberUsers); i++ {
		guildMemberUsersResponses[i] = ToGuildMemberUserResponse(guildMemberUsers[i])
	}

	return guildMemberUsersResponses
}
