package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type DeleteChannelPinRequest struct {
	ID        uuid.UUID `param:"messageID"`
	ChannelID uuid.UUID `param:"channelID"`
}

func (r *DeleteChannelPinRequest) ToDeleteChannelPinCommand(requestorID uuid.UUID) (*command.DeleteChannelPinCommand, error) {
	return &command.DeleteChannelPinCommand{
		ID:          r.ID,
		ChannelID:   r.ChannelID,
		RequestorID: requestorID,
	}, nil
}
