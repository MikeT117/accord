package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type DeleteChannelMessageRequest struct {
	ID        string `param:"messageID"`
	ChannelID string `param:"channelID"`
}

func (r *DeleteChannelMessageRequest) ToDeleteChannelMessageCommand(requestorID string) (*command.DeleteChannelMessageCommand, error) {
	if r.ID == "" && r.ChannelID == "" {
		return nil, NewRequestValidationError("invalid id and/or channel id")
	}
	return &command.DeleteChannelMessageCommand{
		ID:          r.ID,
		ChannelID:   r.ChannelID,
		RequestorID: requestorID,
	}, nil
}
