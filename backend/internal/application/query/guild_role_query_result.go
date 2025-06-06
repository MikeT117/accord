package query

import "github.com/MikeT117/accord/backend/internal/application/common"

type GuildRoleQueryResult struct {
	Result *common.GuildRoleResult
}

type GuildRoleQueryListResult struct {
	Result []*common.GuildRoleResult
}
