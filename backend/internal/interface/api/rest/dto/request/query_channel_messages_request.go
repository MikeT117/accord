package request

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/query"
)

type QueryChannelMessagesRequest struct {
	ChannelID string `param:"channelID"`
	Pinned    bool   `query:"pinned"`
	Before    *int64 `query:"before"`
}

func (r *QueryChannelMessagesRequest) ToChannelMessagesQuery(requestorID string) (*query.ChannelMessagesQuery, error) {

	if r.ChannelID == "" {
		return nil, NewRequestValidationError("invalid channel id")
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

	return query, nil
}

type QueryChannelMessageRequest struct {
	ID        string `param:"messageID"`
	ChannelID string `param:"channelID"`
}

func (r *QueryChannelMessageRequest) ToChannelMessageQuery(requestorID string) (*query.ChannelMessageQuery, error) {

	if r.ChannelID == "" || r.ID == "" {
		return nil, NewRequestValidationError("invalid id and/or channel id")
	}

	return &query.ChannelMessageQuery{
		ID:          r.ID,
		ChannelID:   r.ChannelID,
		RequestorID: requestorID,
	}, nil

}
