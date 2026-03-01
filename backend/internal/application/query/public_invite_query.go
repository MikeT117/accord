package query

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/google/uuid"
)

type PublicInviteQuery struct {
	ID          uuid.UUID
	RequestorID uuid.UUID
}

type PublicInviteQueryResult struct {
	Result *common.PublicInviteResult
}
