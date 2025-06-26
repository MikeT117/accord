package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type CreateUserChannelAssoc struct {
	ChannelID string `param:"channelID"`
	UserID    string `json:"bannerID"`
}

func (r *CreateUserChannelAssoc) ToCreateUserChannelAssociationCommand(requestorID string) (*command.CreateUserChannelAssociationCommand, error) {
	if r.ChannelID == "" || r.UserID == "" {
		return nil, NewRequestValidationError("invalid channel and/or user id")
	}
	return &command.CreateUserChannelAssociationCommand{
		ChannelID:   r.ChannelID,
		RequestorID: requestorID,
		UserID:      r.UserID,
	}, nil
}
