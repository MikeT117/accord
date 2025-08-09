package command

import "github.com/google/uuid"

type UpdateAttachmentCommand struct {
	ID     uuid.UUID
	Status int8
	Height *int64
	Width  *int64
}
