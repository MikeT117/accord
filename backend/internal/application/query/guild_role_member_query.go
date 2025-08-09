package query

import (
	"time"

	"github.com/google/uuid"
)

type GuildRoleMemberQuery struct {
	UserID      uuid.UUID
	GuildID     uuid.UUID
	RoleID      uuid.UUID
	Before      time.Time
	RequestorID uuid.UUID
}

type GuildRoleMembersQuery struct {
	GuildID     uuid.UUID
	RoleID      uuid.UUID
	Before      time.Time
	RequestorID uuid.UUID
}
