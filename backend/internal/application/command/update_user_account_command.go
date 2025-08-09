package command

import "github.com/google/uuid"

type UpdateUserCommand struct {
	ID          uuid.UUID
	DisplayName string
	PublicFlags int8
	AvatarID    *uuid.UUID
	BannerID    *uuid.UUID
}
