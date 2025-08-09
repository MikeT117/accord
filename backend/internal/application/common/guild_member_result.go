package common

import (
	"time"

	"github.com/google/uuid"
)

type GuildMemberResult struct {
	GuildID   uuid.UUID
	Nickname  *string
	CreatedAt time.Time
	UpdatedAt time.Time
	AvatarID  *uuid.UUID
	BannerID  *uuid.UUID
	RoleIDs   []uuid.UUID
}
