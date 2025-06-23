package query

import "github.com/MikeT117/accord/backend/internal/application/common"

type GuildInviteQueryResult struct {
	Result *common.GuildInviteResult
}

type GuildInviteQueryListResult struct {
	Result []*common.GuildInviteResult
}
