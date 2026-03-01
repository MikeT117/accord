package common

import (
	"time"

	"github.com/google/uuid"
)

type GuildMemberResult struct {
	ID          uuid.UUID
	GuildID     uuid.UUID
	DisplayName string
	Username    string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	AvatarID    *uuid.UUID
	BannerID    *uuid.UUID
	RoleIDs     []uuid.UUID
}
