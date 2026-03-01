package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

func NewGuildMemberResultFromGuildMember(guildMember *entities.GuildMember, roleIDs []uuid.UUID, user *entities.User) *common.GuildMemberResult {
	if guildMember == nil {
		return nil
	}

	guildMemberResult := &common.GuildMemberResult{
		ID:          guildMember.UserID,
		GuildID:     guildMember.GuildID,
		DisplayName: user.DisplayName,
		Username:    user.Username,
		CreatedAt:   guildMember.CreatedAt,
		UpdatedAt:   guildMember.UpdatedAt,
		AvatarID:    user.AvatarID,
		BannerID:    user.BannerID,
		RoleIDs:     roleIDs,
	}

	if guildMember.AvatarID != nil {
		guildMemberResult.AvatarID = guildMember.AvatarID
	}

	if guildMember.BannerID != nil {
		guildMemberResult.BannerID = guildMember.BannerID
	}

	if guildMember.Nickname != nil {
		guildMemberResult.DisplayName = *guildMember.Nickname
	}

	return guildMemberResult

}

func NewGuildMemberListResultFromGuildMember(guildMembers []*entities.GuildMember, roles map[uuid.UUID][]uuid.UUID, users map[uuid.UUID]*entities.User) []*common.GuildMemberResult {
	guildMemberResults := make([]*common.GuildMemberResult, len(guildMembers))

	for i := 0; i < len(guildMembers); i++ {
		guildMemberResults[i] = NewGuildMemberResultFromGuildMember(guildMembers[i], roles[guildMembers[i].UserID], users[guildMembers[i].UserID])
	}

	return guildMemberResults
}
