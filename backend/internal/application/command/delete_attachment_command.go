package command

import "github.com/google/uuid"

type DeleteAttachmentCommand struct {
	ID          uuid.UUID
	RequestorID uuid.UUID
}
