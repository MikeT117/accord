package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToGuildCategoryResponse(guildCategory *common.GuildCategoryResult) *response.GuildCategoryResponse {
	if guildCategory == nil {
		return nil
	}
	return &response.GuildCategoryResponse{
		ID:        guildCategory.ID,
		Name:      guildCategory.Name,
		CreatedAt: guildCategory.CreatedAt.Unix(),
		UpdatedAt: guildCategory.UpdatedAt.Unix(),
	}
}

func ToGuildCategoriesResponse(guildCategories []*common.GuildCategoryResult) []*response.GuildCategoryResponse {
	guildCategoriesResponse := make([]*response.GuildCategoryResponse, len(guildCategories))

	for i := 0; i < len(guildCategories); i++ {
		guildCategoriesResponse[i] = ToGuildCategoryResponse(guildCategories[i])
	}

	return guildCategoriesResponse
}
