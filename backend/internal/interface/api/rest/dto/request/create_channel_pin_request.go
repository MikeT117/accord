package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type CreateChannelPinRequest struct {
	ID        uuid.UUID `param:"messageID"`
	ChannelID uuid.UUID `param:"channelID"`
}

func (r *CreateChannelPinRequest) ToCreateChannelPinCommand(requestorID uuid.UUID) (*command.CreateChannelPinCommand, error) {
	return &command.CreateChannelPinCommand{
		ID:          r.ID,
		ChannelID:   r.ChannelID,
		RequestorID: requestorID,
	}, nil
}
