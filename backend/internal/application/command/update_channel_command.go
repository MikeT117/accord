package command

import "github.com/google/uuid"

type UpdateChannelCommand struct {
	ID          uuid.UUID
	ParentID    *uuid.UUID
	Name        string
	Topic       *string
	RequestorID uuid.UUID
}
