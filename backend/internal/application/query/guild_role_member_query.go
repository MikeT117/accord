package query

import "time"

type GuildRoleMemberQuery struct {
	UserID      string
	GuildID     string
	RoleID      string
	Before      time.Time
	RequestorID string
}

type GuildRoleMembersQuery struct {
	GuildID     string
	RoleID      string
	Before      time.Time
	RequestorID string
}
