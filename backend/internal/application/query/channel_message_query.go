package query

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/google/uuid"
)

type ChannelMessagesQuery struct {
	ChannelID   uuid.UUID
	Pinned      bool
	Before      time.Time
	After       time.Time
	RequestorID uuid.UUID
	Limit       int
}

type ChannelMessageQuery struct {
	ID          uuid.UUID
	ChannelID   uuid.UUID
	RequestorID uuid.UUID
}

type ChannelMessageQueryResult struct {
	Result *common.ChannelMessageResult
}

type ChannelMessageQueryListResult struct {
	Result []*common.ChannelMessageResult
}
