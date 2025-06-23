package common

import "time"

type GuildResult struct {
	ID              string
	CreatorID       string
	GuildCategoryID *string
	Name            string
	Description     string
	Discoverable    bool
	ChannelCount    int64
	MemberCount     int64
	CreatedAt       time.Time
	UpdatedAt       time.Time
	IconID          *string
	BannerID        *string
	Roles           []*GuildRoleResult
	Channels        []*ChannelResult
}
