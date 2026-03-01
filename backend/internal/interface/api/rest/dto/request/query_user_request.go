package request

import (
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/google/uuid"
)

type QueryUserRequest struct {
	UserID uuid.UUID `param:"userID"`
}

func (r *QueryUserRequest) ToUserQuery(requestorID uuid.UUID) (*query.UserQuery, error) {
	return &query.UserQuery{
		ID:          r.UserID,
		RequestorID: requestorID,
	}, nil

}
