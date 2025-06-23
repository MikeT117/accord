package query

import "github.com/MikeT117/accord/backend/internal/application/common"

type GuildCategoryQueryResult struct {
	Result *common.GuildCategoryResult
}

type GuildCategoryQueryListResult struct {
	Result []*common.GuildCategoryResult
}
