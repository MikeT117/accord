package query

import "github.com/MikeT117/accord/backend/internal/application/common"

type ChannelMessageQueryResult struct {
	Result *common.ChannelMessageResult
}

type ChannelMessageQueryListResult struct {
	Result []*common.ChannelMessageResult
}
