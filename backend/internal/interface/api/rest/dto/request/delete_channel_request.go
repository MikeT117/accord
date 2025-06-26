package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type DeleteChannelRequest struct {
	ID string `param:"channelID"`
}

func (r *DeleteChannelRequest) ToDeleteChannelCommand(requestorID string) (*command.DeleteChannelCommand, error) {
	if r.ID == "" {
		return nil, NewRequestValidationError("invalid ID")
	}

	return &command.DeleteChannelCommand{
		ID:          r.ID,
		RequestorID: requestorID,
	}, nil
}
