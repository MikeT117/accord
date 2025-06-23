package query

import "github.com/MikeT117/accord/backend/internal/application/common"

type RelationshipQueryResult struct {
	Result *common.RelationshipResult
}

type RelationshipQueryListResult struct {
	Result []*common.RelationshipResult
}
