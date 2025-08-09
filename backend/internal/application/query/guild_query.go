package query

import "github.com/MikeT117/accord/backend/internal/application/common"

type GuildQueryResult struct {
	Result *common.GuildResult
}

type GuildQueryListResult struct {
	Result []*common.GuildResult
}
