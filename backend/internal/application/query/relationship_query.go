package query

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/google/uuid"
)

type RelatationshipsQuery struct {
	RequestorID uuid.UUID
	Before      time.Time
	Status      int8
}

type RelationshipQueryResult struct {
	Result *common.RelationshipResult
}

type RelationshipQueryListResult struct {
	Result []*common.RelationshipResult
}
