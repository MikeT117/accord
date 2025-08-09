package command

import "github.com/google/uuid"

type CreateGuildCommand struct {
	CreatorID uuid.UUID
	Name      string
	IconID    *uuid.UUID
}
