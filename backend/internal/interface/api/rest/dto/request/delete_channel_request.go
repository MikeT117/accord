package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type DeleteChannelRequest struct {
	ID uuid.UUID `param:"channelID"`
}

func (r *DeleteChannelRequest) ToDeleteChannelCommand(requestorID uuid.UUID) (*command.DeleteChannelCommand, error) {
	return &command.DeleteChannelCommand{
		ID:          r.ID,
		RequestorID: requestorID,
	}, nil
}
