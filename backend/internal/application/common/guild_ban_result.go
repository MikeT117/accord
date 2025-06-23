package common

import "time"

type GuildBanResult struct {
	UserID    string
	GuildID   string
	Reason    string
	CreatedAt time.Time
	UpdatedAt time.Time
}
