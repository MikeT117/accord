package common

import "time"

type ChannelResult struct {
	ID          string
	CreatorID   string
	GuildID     *string
	ParentID    *string
	Name        *string
	Topic       *string
	ChannelType int8
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Users       []*UserResult
	RoleIDs     []string
}
