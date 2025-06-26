package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type DeleteUserChannelAssoc struct {
	ChannelID string `param:"channelID"`
	UserID    string `json:"bannerID"`
}

func (r *DeleteUserChannelAssoc) ToDeleteUserChannelAssociationCommand(requestorID string) (*command.DeleteUserChannelAssociationCommand, error) {
	if r.ChannelID == "" || r.UserID == "" {
		return nil, NewRequestValidationError("invalid channel and/or user id")
	}
	return &command.DeleteUserChannelAssociationCommand{
		ChannelID:   r.ChannelID,
		RequestorID: requestorID,
		UserID:      r.UserID,
	}, nil
}
