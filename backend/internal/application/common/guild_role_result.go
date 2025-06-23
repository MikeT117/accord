package common

import "time"

type GuildRoleResult struct {
	ID          string
	GuildID     string
	Name        string
	Permissions int32
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
