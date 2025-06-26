package query

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/common"
)

type GuildInvitesQuery struct {
	GuildID     string
	Before      time.Time
	RequestorID string
}

type GuildInviteQuery struct {
	ID          string
	RequestorID string
}

type GuildInviteQueryResult struct {
	Result *common.GuildInviteResult
}

type GuildInviteQueryListResult struct {
	Result []*common.GuildInviteResult
}
