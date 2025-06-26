package request

import (
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/application/query"
)

type QueryGuildMembersRequest struct {
	GuildID string     `param:"guildID"`
	Before  *time.Time `query:"before"`
}

func (r *QueryGuildMembersRequest) ToGuildMembersQuery(requestorID string) (*query.GuildMembersQuery, error) {

	if strings.Trim(r.GuildID, " ") == "" {
		return nil, NewRequestValidationError("invalid guild id")
	}

	query := &query.GuildMembersQuery{
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}

	if r.Before != nil {
		query.Before = *r.Before
	} else {
		query.Before = time.Now().UTC()
	}

	return query, nil
}

type QueryGuildMemberRequest struct {
	GuildID string `param:"guildID"`
	UserID  string `param:"userID"`
}

func (r *QueryGuildMemberRequest) ToGuildMemberQuery(requestorID string) (*query.GuildMemberQuery, error) {

	if strings.Trim(r.GuildID, " ") == "" || strings.Trim(r.UserID, " ") == "" {
		return nil, NewRequestValidationError("invalid guild id and/or user id")
	}

	return &query.GuildMemberQuery{
		GuildID:     r.GuildID,
		UserID:      r.UserID,
		RequestorID: requestorID,
	}, nil

}
