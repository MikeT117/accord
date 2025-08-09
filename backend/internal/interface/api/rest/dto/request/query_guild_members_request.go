package request

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/google/uuid"
)

type QueryGuildMembersRequest struct {
	GuildID uuid.UUID  `param:"guildID"`
	Before  *time.Time `query:"before"`
}

func (r *QueryGuildMembersRequest) ToGuildMembersQuery(requestorID uuid.UUID) (*query.GuildMembersQuery, error) {
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
	GuildID uuid.UUID `param:"guildID"`
	UserID  uuid.UUID `param:"userID"`
}

func (r *QueryGuildMemberRequest) ToGuildMemberQuery(requestorID uuid.UUID) (*query.GuildMemberQuery, error) {
	return &query.GuildMemberQuery{
		GuildID:     r.GuildID,
		UserID:      r.UserID,
		RequestorID: requestorID,
	}, nil

}
