package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type DeleteRelationshipRequest struct {
	ID uuid.UUID `param:"relationshipID"`
}

func (r *DeleteRelationshipRequest) ToDeleteRelationshipCommand(requestorID uuid.UUID) (*command.DeleteRelationshipCommand, error) {
	return &command.DeleteRelationshipCommand{
		ID:          r.ID,
		RequestorID: requestorID,
	}, nil
}
