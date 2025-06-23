package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type UpdateChannelRequest struct {
	ParentID *string `json:"parentID"`
	Name     string  `json:"name"`
	Topic    *string `json:"topic"`
}

func (r *UpdateChannelRequest) ToUpdateChannelCommand(ID string) *command.UpdateChannelCommand {
	return &command.UpdateChannelCommand{
		ID:       ID,
		ParentID: r.ParentID,
		Name:     r.Name,
		Topic:    r.Topic,
	}
}
