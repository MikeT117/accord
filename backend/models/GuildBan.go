package models

import (
	"time"
)

type GuildBan struct {
	Reason   *string     `json:"reason"`
	BannedAt time.Time   `json:"bannedAt"`
	User     UserLimited `json:"user"`
}
