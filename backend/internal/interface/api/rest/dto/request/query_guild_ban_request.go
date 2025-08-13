package request

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/google/uuid"
)

type QueryGuildBansRequest struct {
	GuildID uuid.UUID  `param:"guildID"`
	Before  *time.Time `query:"before"`
	Limit   *int       `query:"limit"`
}

func (r *QueryGuildBansRequest) ToGuildBansQuery(requestorID uuid.UUID) (*query.GuildBansQuery, error) {
	query := &query.GuildBansQuery{
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}

	if r.Before != nil {
		query.Before = *r.Before
	} else {
		query.Before = time.Now().UTC()
	}

	if r.Limit != nil && query.Limit <= 50 && query.Limit > 0 {
		query.Limit = *r.Limit
	} else {
		query.Limit = 50
	}

	return query, nil
}
