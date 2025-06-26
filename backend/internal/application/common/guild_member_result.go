package common

import "time"

type GuildMemberResult struct {
	GuildID   string
	Nickname  *string
	CreatedAt time.Time
	UpdatedAt time.Time
	AvatarID  *string
	BannerID  *string
	Roles     []string
}
