package command

import "github.com/google/uuid"

type UpdateAccountCommand struct {
	UserID          uuid.UUID
	Password        string
	UpdatedPassword string
}
