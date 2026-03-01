package query

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/google/uuid"
)

type UserQuery struct {
	ID          uuid.UUID
	RequestorID uuid.UUID
}

type UserQueryResult struct {
	Result *common.UserResult
}
