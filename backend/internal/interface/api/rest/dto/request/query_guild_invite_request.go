package request

import (
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/application/query"
)

type QueryGuildInviteRequest struct {
	ID string `param:"inviteID"`
}

func (r *QueryGuildInviteRequest) ToGuildInviteQuery(requestorID string) (*query.GuildInviteQuery, error) {

	if strings.Trim(r.ID, " ") == "" {
		return nil, NewRequestValidationError("invalid id")
	}

	return &query.GuildInviteQuery{
		ID:          r.ID,
		RequestorID: requestorID,
	}, nil

}

type QueryGuildInvitesRequest struct {
	GuildID string     `param:"guildID"`
	Before  *time.Time `query:"before"`
}

func (r *QueryGuildInvitesRequest) ToGuildInvitesQuery(requestorID string) (*query.GuildInvitesQuery, error) {

	if strings.Trim(r.GuildID, " ") == "" {
		return nil, NewRequestValidationError("invalid guild ud")
	}

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
