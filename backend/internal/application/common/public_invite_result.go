package common

import (
	"time"

	"github.com/google/uuid"
)

type PublicInviteResult struct {
	ID           uuid.UUID
	GuildID      uuid.UUID
	CreatedAt    time.Time
	UpdatedAt    time.Time
	ExpiresAt    time.Time
	Name         string
	Description  string
	ChannelCount int64
	MemberCount  int64
	IconID       *uuid.UUID
	BannerID     *uuid.UUID
}
