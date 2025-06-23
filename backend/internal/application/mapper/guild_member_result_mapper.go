package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func NewGuildMemberResultFromGuildMember(guildMember *entities.GuildMember, roles []string) *common.GuildMemberResult {
	if guildMember == nil {
		return nil
	}

	return &common.GuildMemberResult{
		UserID:    guildMember.UserID,
		GuildID:   guildMember.GuildID,
		Nickname:  guildMember.Nickname,
		CreatedAt: guildMember.CreatedAt,
		UpdatedAt: guildMember.UpdatedAt,
		AvatarID:  guildMember.AvatarID,
		BannerID:  guildMember.BannerID,
		Roles:     roles,
	}
}

func NewGuildMemberListResultFromGuildMember(guildMembers []*entities.GuildMember, roles map[string][]string) []*common.GuildMemberResult {
	guildMemberResults := make([]*common.GuildMemberResult, len(guildMembers))

	for i := 0; i < len(guildMembers); i++ {
		guildMemberResults[i] = NewGuildMemberResultFromGuildMember(guildMembers[i], roles[guildMembers[i].UserID])
	}

	return guildMemberResults
}

func NewGuildMemberWithoutRolesResultFromGuildMember(guildMember *entities.GuildMember) *common.GuildMemberResult {
	if guildMember == nil {
		return nil
	}

	return &common.GuildMemberResult{
		UserID:    guildMember.UserID,
		GuildID:   guildMember.GuildID,
		Nickname:  guildMember.Nickname,
		CreatedAt: guildMember.CreatedAt,
		UpdatedAt: guildMember.UpdatedAt,
		AvatarID:  guildMember.AvatarID,
		BannerID:  guildMember.BannerID,
		Roles:     []string{},
	}
}

func NewGuildMemberWithoutRolesListResultFromGuildMember(guildMembers []*entities.GuildMember) []*common.GuildMemberResult {
	guildMemberResults := make([]*common.GuildMemberResult, len(guildMembers))

	for i := 0; i < len(guildMembers); i++ {
		guildMemberResults[i] = NewGuildMemberWithoutRolesResultFromGuildMember(guildMembers[i])
	}

	return guildMemberResults
}
