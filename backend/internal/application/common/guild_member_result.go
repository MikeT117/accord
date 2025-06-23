package common

import "time"

type GuildMemberResult struct {
	UserID    string
	GuildID   string
	Nickname  *string
	CreatedAt time.Time
	UpdatedAt time.Time
	AvatarID  *string
	BannerID  *string
	Roles     []string
}
