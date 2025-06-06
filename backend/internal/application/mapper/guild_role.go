package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func NewGuildRoleResultFromGuildRole(guildRole *entities.GuildRole) *common.GuildRoleResult {
	return &common.GuildRoleResult{
		ID:          guildRole.ID,
		GuildID:     guildRole.GuildID,
		Name:        guildRole.Name,
		Permissions: guildRole.Permissions,
		CreatedAt:   guildRole.CreatedAt,
		UpdatedAt:   guildRole.UpdatedAt,
	}
}

func NewGuildRoleListResultFromGuildRole(guildRoles []*entities.GuildRole) []*common.GuildRoleResult {
	guildRoleResults := make([]*common.GuildRoleResult, len(guildRoles))

	for i := 0; i < len(guildRoles); i++ {
		guildRoleResults[i] = NewGuildRoleResultFromGuildRole(guildRoles[i])
	}

	return guildRoleResults
}
