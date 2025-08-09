package command

import "github.com/google/uuid"

type CreateUserChannelAssociationCommand struct {
	ChannelID   uuid.UUID
	UserID      uuid.UUID
	RequestorID uuid.UUID
}
