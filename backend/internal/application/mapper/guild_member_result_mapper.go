package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

func NewGuildMemberResultFromGuildMember(guildMember *entities.GuildMember, roleIDs []uuid.UUID) *common.GuildMemberResult {
	if guildMember == nil {
		return nil
	}

	return &common.GuildMemberResult{
		GuildID:   guildMember.GuildID,
		Nickname:  guildMember.Nickname,
		CreatedAt: guildMember.CreatedAt,
		UpdatedAt: guildMember.UpdatedAt,
		AvatarID:  guildMember.AvatarID,
		BannerID:  guildMember.BannerID,
		RoleIDs:   roleIDs,
	}

}

func NewGuildMemberListResultFromGuildMember(guildMembers []*entities.GuildMember, roles map[uuid.UUID][]uuid.UUID) []*common.GuildMemberResult {
	guildMemberResults := make([]*common.GuildMemberResult, len(guildMembers))

	for i := 0; i < len(guildMembers); i++ {
		guildMemberResults[i] = NewGuildMemberResultFromGuildMember(guildMembers[i], roles[guildMembers[i].UserID])
	}

	return guildMemberResults
}
