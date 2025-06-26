package command

import "time"

type CreateGuildInviteCommand struct {
	GuildID     string
	ExpiresAt   time.Time
	RequestorID string
}
