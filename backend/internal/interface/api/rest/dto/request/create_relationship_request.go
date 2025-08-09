package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type CreateRelationshipRequest struct {
	Status      int8      `json:"status"`
	RecipientID uuid.UUID `json:"recipientID"`
}

func (r *CreateRelationshipRequest) ToCreateRelationshipCommand(requestorID uuid.UUID) (*command.CreateRelationshipCommand, error) {
	if r.Status > 2 || r.Status < 0 {
		return nil, NewRequestValidationError("invalid status")
	}

	return &command.CreateRelationshipCommand{
		CreatorID:   requestorID,
		RecipientID: r.RecipientID,
		Status:      r.Status,
	}, nil
}
