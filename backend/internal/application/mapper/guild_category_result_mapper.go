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

func NewGuildCategoryListResultFromGuildCategory(guildCategories []*entities.GuildCategory) []*common.GuildCategoryResult {
	guildCategoriesResult := make([]*common.GuildCategoryResult, len(guildCategories))

	for i := 0; i < len(guildCategories); i++ {
		guildCategoriesResult[i] = NewGuildCategoryResultFromGuildCategory(guildCategories[i])
	}

	return guildCategoriesResult
}
