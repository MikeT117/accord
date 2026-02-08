package common

import "github.com/google/uuid"

type VoiceStateUserResult struct {
	ID          uuid.UUID
	Username    string
	DisplayName string
	PublicFlags int8
	Avatar      *uuid.UUID
	Banner      *uuid.UUID
}
