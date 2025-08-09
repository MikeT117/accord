package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type CreateUserChannelAssoc struct {
	ChannelID uuid.UUID `param:"channelID"`
	UserID    uuid.UUID `json:"bannerID"`
}

func (r *CreateUserChannelAssoc) ToCreateUserChannelAssociationCommand(requestorID uuid.UUID) (*command.CreateUserChannelAssociationCommand, error) {
	return &command.CreateUserChannelAssociationCommand{
		ChannelID:   r.ChannelID,
		RequestorID: requestorID,
		UserID:      r.UserID,
	}, nil
}
