package query

import "github.com/MikeT117/accord/backend/internal/application/common"

type ChannelQueryResult struct {
	Result *common.ChannelResult
}

type ChannelQueryListResult struct {
	Result []*common.ChannelResult
}
