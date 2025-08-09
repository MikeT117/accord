package request

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/google/uuid"
)

type QueryGuildInviteRequest struct {
	ID uuid.UUID `param:"inviteID"`
}

func (r *QueryGuildInviteRequest) ToGuildInviteQuery(requestorID uuid.UUID) (*query.GuildInviteQuery, error) {
	return &query.GuildInviteQuery{
		ID:          r.ID,
		RequestorID: requestorID,
	}, nil

}

type QueryGuildInvitesRequest struct {
	GuildID uuid.UUID  `param:"guildID"`
	Before  *time.Time `query:"before"`
}

func (r *QueryGuildInvitesRequest) ToGuildInvitesQuery(requestorID uuid.UUID) (*query.GuildInvitesQuery, error) {
	query := &query.GuildInvitesQuery{
		RequestorID: requestorID,
	}

	if r.Before != nil {
		query.Before = *r.Before
	} else {
		query.Before = time.Now().UTC()
	}

	return query, nil
}
