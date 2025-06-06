package query

import "github.com/MikeT117/accord/backend/internal/application/common"

type SessionQueryResult struct {
	Result *common.SessionResult
}

type SessionQueryListResult struct {
	Result []*common.SessionResult
}
