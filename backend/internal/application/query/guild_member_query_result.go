package query

import "github.com/MikeT117/accord/backend/internal/application/common"

type GuildMemberQueryResult struct {
	Result *common.GuildMemberResult
}

type GuildMemberQueryListResult struct {
	Result []*common.GuildMemberResult
}
