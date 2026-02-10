package query

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/common"
)

type GuildQueryResult struct {
	Result *common.GuildResult
}

type GuildQueryListResult struct {
	Result []*common.GuildResult
}

type DiscoverableGuildsQuery struct {
	Before time.Time
	After  time.Time
	Limit  int
}

type DiscoverableGuildsQueryResult struct {
	Result []*common.GuildResult
}
