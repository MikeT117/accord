package command

import "github.com/google/uuid"

type UpdateSessionCommand struct {
	ID     uuid.UUID
	UserID uuid.UUID
	Token  string
}
