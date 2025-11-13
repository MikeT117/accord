package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type CreateRelationshipRequest struct {
	Status   int8   `json:"status"`
	Username string `json:"username"`
}

func (r *CreateRelationshipRequest) ToCreateRelationshipCommand(requestorID uuid.UUID) (*command.CreateRelationshipCommand, error) {
	if r.Status > 2 || r.Status < 0 {
		return nil, NewRequestValidationError("invalid status")
	}

	return &command.CreateRelationshipCommand{
		CreatorID: requestorID,
		Username:  r.Username,
		Status:    r.Status,
	}, nil
}
