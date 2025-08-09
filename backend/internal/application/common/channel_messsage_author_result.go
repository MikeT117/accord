package common

import "github.com/google/uuid"

type ChannelMessageAuthorResult struct {
	ID          uuid.UUID
	Username    string
	DisplayName string
	PublicFlags int8
	Avatar      *uuid.UUID
	Banner      *uuid.UUID
}
