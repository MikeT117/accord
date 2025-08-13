package query

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/google/uuid"
)

type GuildBansQuery struct {
	GuildID     uuid.UUID
	Before      time.Time
	Limit       int
	RequestorID uuid.UUID
}

type GuildBanQueryResult struct {
	Result *common.GuildBanResult
}

type GuildBanQueryListResult struct {
	Result []*common.GuildBanResult
}
