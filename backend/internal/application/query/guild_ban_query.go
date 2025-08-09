package query

import "github.com/MikeT117/accord/backend/internal/application/common"

type GuildBanQueryResult struct {
	Result *common.GuildBanResult
}

type GuildBanQueryListResult struct {
	Result []*common.GuildBanResult
}
