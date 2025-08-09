package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

func NewGuildMemberUserResultFromGuildMember(guildMember *entities.GuildMember, roleIDs []uuid.UUID, user *entities.User) *common.GuildMemberUserResult {
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
			RoleIDs:   roleIDs,
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

func NewGuildMemberUserListResultFromGuildMember(guildMembers []*entities.GuildMember, roles map[uuid.UUID][]uuid.UUID, users map[uuid.UUID]*entities.User) []*common.GuildMemberUserResult {
	guildMemberResults := make([]*common.GuildMemberUserResult, len(guildMembers))

	for i := 0; i < len(guildMembers); i++ {
		guildMemberResults[i] = NewGuildMemberUserResultFromGuildMember(guildMembers[i], roles[guildMembers[i].UserID], users[guildMembers[i].UserID])
	}

	return guildMemberResults
}
