package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type CreateRelationshipRequest struct {
	Status      int8   `json:"status"`
	RecipientID string `json:"recipientID"`
}

func (r *CreateRelationshipRequest) ToCreateRelationshipCommand(requestorID string) (*command.CreateRelationshipCommand, error) {
	if r.Status > 2 || r.Status < 0 || strings.Trim(r.RecipientID, " ") == "" {
		return nil, NewRequestValidationError("invalid status")
	}

	return &command.CreateRelationshipCommand{
		CreatorID:   requestorID,
		RecipientID: r.RecipientID,
		Status:      r.Status,
	}, nil
}
