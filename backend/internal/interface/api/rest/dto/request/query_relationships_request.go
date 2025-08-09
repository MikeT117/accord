package request

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/google/uuid"
)

type QueryRelationshipsRequest struct {
	Before *int64 `query:"before"`
	Status *int   `query:"status"`
}

func (r *QueryRelationshipsRequest) ToRelationshipsQuery(requestorID uuid.UUID) (*query.RelatationshipsQuery, error) {

	query := &query.RelatationshipsQuery{
		RequestorID: requestorID,
	}

	if r.Status == nil {
		query.Status = 0
	} else if *r.Status != 0 && *r.Status != 1 && *r.Status != 2 {
		return nil, NewRequestValidationError("invalid status")
	}

	if r.Before != nil {
		query.Before = time.Unix(*r.Before, 0)
	} else {
		query.Before = time.Now().UTC()
	}

	return query, nil
}
