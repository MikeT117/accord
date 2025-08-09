package query

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/google/uuid"
)

type GuildInvitesQuery struct {
	GuildID     uuid.UUID
	Before      time.Time
	RequestorID uuid.UUID
}

type GuildInviteQuery struct {
	ID          uuid.UUID
	RequestorID uuid.UUID
}

type GuildInviteQueryResult struct {
	Result *common.GuildInviteResult
}

type GuildInviteQueryListResult struct {
	Result []*common.GuildInviteResult
}
