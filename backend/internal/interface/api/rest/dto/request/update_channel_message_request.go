package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type UpdateChannelMessageRequest struct {
	ID        string `param:"messageID"`
	ChannelID string `param:"channelID"`
	Content   string `json:"content"`
}

func (r *UpdateChannelMessageRequest) ToUpdateChannelMessageCommand(requestorID string) (*command.UpdateChannelMessageCommand, error) {
	if r.ID == "" && r.ChannelID == "" {
		return nil, NewRequestValidationError("invalid id and/or channel id")
	}

	return &command.UpdateChannelMessageCommand{
		ID:          r.ID,
		Content:     r.Content,
		ChannelID:   r.ChannelID,
		RequestorID: requestorID,
	}, nil
}
