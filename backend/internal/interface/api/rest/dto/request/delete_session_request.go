package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type DeleteSessionRequest struct {
	ID string `param:"sessionID"`
}

func (r *DeleteSessionRequest) ToDeleteSessionCommand(requestorID string) (*command.DeleteSessionCommand, error) {

	return &command.DeleteSessionCommand{
		ID:          r.ID,
		RequestorID: requestorID,
	}, nil
}
