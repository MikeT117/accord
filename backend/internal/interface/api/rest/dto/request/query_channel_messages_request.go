package request

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/google/uuid"
)

type QueryChannelMessagesRequest struct {
	ChannelID uuid.UUID `param:"channelID"`
	Pinned    bool      `query:"pinned"`
	Before    *int64    `query:"before"`
	After     *int64    `query:"after"`
	Limit     *int      `query:"limit"`
}

func (r *QueryChannelMessagesRequest) ToChannelMessagesQuery(requestorID uuid.UUID) (*query.ChannelMessagesQuery, error) {

	if r.After != nil && r.Before != nil {
		return nil, NewRequestValidationError("invalid query")
	}

	query := &query.ChannelMessagesQuery{
		ChannelID:   r.ChannelID,
		Pinned:      r.Pinned,
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

	if r.Limit != nil && query.Limit <= 50 && query.Limit > 0 {
		query.Limit = *r.Limit
	} else {
		query.Limit = 50
	}

	return query, nil
}

type QueryChannelMessageRequest struct {
	ID        uuid.UUID `param:"messageID"`
	ChannelID uuid.UUID `param:"channelID"`
}

func (r *QueryChannelMessageRequest) ToChannelMessageQuery(requestorID uuid.UUID) (*query.ChannelMessageQuery, error) {
	return &query.ChannelMessageQuery{
		ID:          r.ID,
		ChannelID:   r.ChannelID,
		RequestorID: requestorID,
	}, nil

}
