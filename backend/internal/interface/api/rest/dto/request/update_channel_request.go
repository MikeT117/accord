package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type UpdateChannelRequest struct {
	ID       string  `param:"channelID"`
	ParentID *string `json:"parentId"`
	Name     string  `json:"name"`
	Topic    *string `json:"topic"`
}

func (r *UpdateChannelRequest) ToUpdateChannelCommand(requestorID string) (*command.UpdateChannelCommand, error) {
	if r.ID == "" || r.ParentID != nil && *r.ParentID == "" || r.Name == "" {
		return nil, NewRequestValidationError("invalid id, parentID or name")
	}
	return &command.UpdateChannelCommand{
		ID:          r.ID,
		ParentID:    r.ParentID,
		Name:        r.Name,
		Topic:       r.Topic,
		RequestorID: requestorID,
	}, nil
}
