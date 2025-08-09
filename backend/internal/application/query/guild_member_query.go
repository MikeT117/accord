package query

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/google/uuid"
)

type GuildMembersQuery struct {
	GuildID     uuid.UUID
	Before      time.Time
	RequestorID uuid.UUID
}

type GuildMemberQuery struct {
	UserID      uuid.UUID
	GuildID     uuid.UUID
	RequestorID uuid.UUID
}

type GuildMemberQueryResult struct {
	Result *common.GuildMemberUserResult
}

type GuildMemberQueryListResult struct {
	Result []*common.GuildMemberUserResult
}
