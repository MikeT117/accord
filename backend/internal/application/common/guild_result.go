package common

import (
	"time"

	"github.com/google/uuid"
)

type GuildResult struct {
	ID              uuid.UUID
	CreatorID       uuid.UUID
	GuildCategoryID *uuid.UUID
	Name            string
	Description     string
	Discoverable    bool
	ChannelCount    int64
	MemberCount     int64
	CreatedAt       time.Time
	UpdatedAt       time.Time
	IconID          *uuid.UUID
	BannerID        *uuid.UUID
	Roles           []*GuildRoleResult
	Channels        []*ChannelResult
	VoiceStates     []*VoiceStateResult
}
