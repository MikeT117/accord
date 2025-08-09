package common

import (
	"time"

	"github.com/google/uuid"
)

type ChannelResult struct {
	ID          uuid.UUID
	CreatorID   uuid.UUID
	GuildID     *uuid.UUID
	ParentID    *uuid.UUID
	Name        *string
	Topic       *string
	ChannelType int8
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Users       []*UserResult
	RoleIDs     []uuid.UUID
}
