package request

import (
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/google/uuid"
)

type QueryPublicInviteRequest struct {
	ID uuid.UUID `param:"inviteID"`
}

func (r *QueryPublicInviteRequest) ToPublicInviteQuery(requestorID uuid.UUID) (*query.PublicInviteQuery, error) {
	return &query.PublicInviteQuery{
		ID:          r.ID,
		RequestorID: requestorID,
	}, nil

}
