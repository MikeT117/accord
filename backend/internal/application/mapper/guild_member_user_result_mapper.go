package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func NewGuildMemberUserResultFromGuildMember(guildMember *entities.GuildMember, roles []string, user *entities.User) *common.GuildMemberUserResult {
	if guildMember == nil {
		return nil
	}

	return &common.GuildMemberUserResult{
		GuildMember: &common.GuildMemberResult{
			GuildID:   guildMember.GuildID,
			Nickname:  guildMember.Nickname,
			CreatedAt: guildMember.CreatedAt,
			UpdatedAt: guildMember.UpdatedAt,
			AvatarID:  guildMember.AvatarID,
			BannerID:  guildMember.BannerID,
			Roles:     roles,
		},
		User: &common.UserResult{
			ID:          user.ID,
			AccountID:   user.AccountID,
			Username:    user.Username,
			DisplayName: user.DisplayName,
			Email:       user.Email,
			PublicFlags: user.PublicFlags,
			AvatarID:    user.AvatarID,
			BannerID:    user.BannerID,
		},
	}

}

func NewGuildMemberUserListResultFromGuildMember(guildMembers []*entities.GuildMember, roles map[string][]string, users map[string]*entities.User) []*common.GuildMemberUserResult {
	guildMemberResults := make([]*common.GuildMemberUserResult, len(guildMembers))

	for i := 0; i < len(guildMembers); i++ {
		guildMemberResults[i] = NewGuildMemberUserResultFromGuildMember(guildMembers[i], roles[guildMembers[i].UserID], users[guildMembers[i].UserID])
	}

	return guildMemberResults
}
