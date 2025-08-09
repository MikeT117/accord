package query

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/common"
)

type RelatationshipsQuery struct {
	RequestorID string
	Before      time.Time
	Status      int8
}

type RelationshipQueryResult struct {
	Result *common.RelationshipResult
}

type RelationshipQueryListResult struct {
	Result []*common.RelationshipResult
}
