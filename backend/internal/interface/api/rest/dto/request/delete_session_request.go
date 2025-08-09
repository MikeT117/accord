package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type DeleteSessionRequest struct {
	ID uuid.UUID `param:"sessionID"`
}

func (r *DeleteSessionRequest) ToDeleteSessionCommand(requestorID uuid.UUID) (*command.DeleteSessionCommand, error) {
	return &command.DeleteSessionCommand{
		ID:          r.ID,
		RequestorID: requestorID,
	}, nil
}
