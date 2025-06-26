package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type UpdateRelationshipRequest struct {
	ID     string `param:"relationshipID"`
	Status int8   `json:"status"`
}

func (r *UpdateRelationshipRequest) ToUpdateRelationshipCommand(requestorID string) (*command.UpdateRelationshipCommand, error) {
	if strings.Trim(r.ID, " ") == "" {
		return nil, NewRequestValidationError("invalid id")
	}

	return &command.UpdateRelationshipCommand{
		ID:          r.ID,
		Status:      r.Status,
		RequestorID: requestorID,
	}, nil
}
