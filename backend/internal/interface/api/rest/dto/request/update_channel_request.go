package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type UpdateChannelRequest struct {
	ID       uuid.UUID  `param:"channelID"`
	ParentID *uuid.UUID `json:"parentId"`
	Name     string     `json:"name"`
	Topic    *string    `json:"topic"`
}

func (r *UpdateChannelRequest) ToUpdateChannelCommand(requestorID uuid.UUID) (*command.UpdateChannelCommand, error) {
	if strings.Trim(r.Name, " ") == "" {
		return nil, NewRequestValidationError("invalid name")
	}
	return &command.UpdateChannelCommand{
		ID:          r.ID,
		ParentID:    r.ParentID,
		Name:        r.Name,
		Topic:       r.Topic,
		RequestorID: requestorID,
	}, nil
}
