package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func NewGuildCategoryResultFromGuildCategory(guildCatgeory *entities.GuildCategory) *common.GuildCategoryResult {
	return &common.GuildCategoryResult{
		ID:        guildCatgeory.ID,
		Name:      guildCatgeory.Name,
		CreatedAt: guildCatgeory.CreatedAt,
		UpdatedAt: guildCatgeory.UpdatedAt,
	}
}
