package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type DeleteUserChannelAssoc struct {
	ChannelID uuid.UUID `param:"channelID"`
	UserID    uuid.UUID `json:"bannerID"`
}

func (r *DeleteUserChannelAssoc) ToDeleteUserChannelAssociationCommand(requestorID uuid.UUID) (*command.DeleteUserChannelAssociationCommand, error) {
	return &command.DeleteUserChannelAssociationCommand{
		ChannelID:   r.ChannelID,
		RequestorID: requestorID,
		UserID:      r.UserID,
	}, nil
}
