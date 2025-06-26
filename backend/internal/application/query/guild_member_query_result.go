package query

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/common"
)

type GuildMembersQuery struct {
	GuildID     string
	Before      time.Time
	RequestorID string
}

type GuildMemberQuery struct {
	UserID      string
	GuildID     string
	RequestorID string
}

type GuildMemberQueryResult struct {
	Result *common.GuildMemberUserResult
}

type GuildMemberQueryListResult struct {
	Result []*common.GuildMemberUserResult
}
