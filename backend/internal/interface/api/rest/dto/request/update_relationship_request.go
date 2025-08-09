package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type UpdateRelationshipRequest struct {
	ID     uuid.UUID `param:"relationshipID"`
	Status int8      `json:"status"`
}

func (r *UpdateRelationshipRequest) ToUpdateRelationshipCommand(requestorID uuid.UUID) (*command.UpdateRelationshipCommand, error) {
	return &command.UpdateRelationshipCommand{
		ID:          r.ID,
		Status:      r.Status,
		RequestorID: requestorID,
	}, nil
}
