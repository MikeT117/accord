package query

import "github.com/MikeT117/accord/backend/internal/application/common"

type VoiceStateQueryResult struct {
	Result *common.VoiceStateResult
}

type VoiceStateQueryListResult struct {
	Result []*common.VoiceStateResult
}
