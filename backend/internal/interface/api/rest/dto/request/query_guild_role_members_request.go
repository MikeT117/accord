package request

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/query"
)

type QueryGuildRoleMembersRequest struct {
	GuildID  string `param:"guildID"`
	RoleID   string `param:"roleID"`
	Assigned *bool  `query:"assigned"`
	Before   *int64 `query:"before"`
}

func (r *QueryGuildRoleMembersRequest) ToGuildRoleMembersQuery(requestorID string) (*query.GuildRoleMembersQuery, error) {

	query := &query.GuildRoleMembersQuery{
		RequestorID: requestorID,
		GuildID:     r.GuildID,
		RoleID:      r.RoleID,
	}

	if r.Before != nil {
		query.Before = time.Unix(*r.Before, 0)
	} else {
		query.Before = time.Now().UTC()
	}

	return query, nil
}
