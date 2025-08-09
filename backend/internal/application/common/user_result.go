package common

import "github.com/google/uuid"

type UserResult struct {
	ID          uuid.UUID
	AccountID   uuid.UUID
	Username    string
	DisplayName string
	Email       string
	PublicFlags int8
	AvatarID    *uuid.UUID
	BannerID    *uuid.UUID
}
