package common

import "time"

type GuildInviteResult struct {
	ID           string
	UsedCount    int64
	GuildID      string
	CreatedAt    time.Time
	UpdatedAt    time.Time
	ExpiresAt    time.Time
	Name         string
	Description  string
	ChannelCount int64
	MemberCount  int64
	IconID       *string
	BannerID     *string
}
