package query

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/common"
)

type ChannelMessagesQuery struct {
	ChannelID   string
	Pinned      bool
	Before      time.Time
	After       time.Time
	RequestorID string
	Limit       int
}

type ChannelMessageQuery struct {
	ID          string
	ChannelID   string
	RequestorID string
}

type ChannelMessageQueryResult struct {
	Result *common.ChannelMessageResult
}

type ChannelMessageQueryListResult struct {
	Result []*common.ChannelMessageResult
}
