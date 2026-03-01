package command

import "github.com/google/uuid"

type CompleteUserRegistrationCommand struct {
	ID          uuid.UUID
	DisplayName string
	Username    string
}
