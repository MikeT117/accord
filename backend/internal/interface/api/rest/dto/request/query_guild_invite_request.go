package request

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/google/uuid"
)

type QueryGuildInvitesRequest struct {
	GuildID uuid.UUID `param:"guildID"`
	Before  *int64    `query:"before"`
	After   *int64    `query:"after"`
	Limit   *int      `query:"limit"`
}

func (r *QueryGuildInvitesRequest) ToGuildInvitesQuery(requestorID uuid.UUID) (*query.GuildInvitesQuery, error) {
	query := &query.GuildInvitesQuery{
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}

	if r.Before != nil {
		query.Before = time.Unix(*r.Before, 0)
	} else {
		query.Before = time.Now().UTC()
	}

	if r.After != nil {
		query.After = time.Unix(*r.After, 0)
	} else {
		query.After = time.Unix(0, 0)
	}

	if r.Limit != nil && *r.Limit <= 50 && *r.Limit > 0 {
		query.Limit = *r.Limit
	} else {
		query.Limit = 50
	}

	return query, nil
}
