package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type DeleteRelationshipRequest struct {
	ID string `param:"relationshipID"`
}

func (r *DeleteRelationshipRequest) ToDeleteRelationshipCommand(requestorID string) (*command.DeleteRelationshipCommand, error) {
	if strings.Trim(r.ID, " ") == "" {
		return nil, NewRequestValidationError("invalid id")
	}

	return &command.DeleteRelationshipCommand{
		ID:          r.ID,
		RequestorID: requestorID,
	}, nil
}
