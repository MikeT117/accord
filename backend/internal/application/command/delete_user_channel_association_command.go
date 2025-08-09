package command

import "github.com/google/uuid"

type DeleteUserChannelAssociationCommand struct {
	ChannelID   uuid.UUID
	UserID      uuid.UUID
	RequestorID uuid.UUID
}
