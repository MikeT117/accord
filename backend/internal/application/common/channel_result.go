package common

type ChannelResult struct {
	ID          string
	CreatorID   *string
	GuildID     *string
	ParentID    *string
	Name        *string
	Topic       *string
	ChannelType int8
	CreatedAt   int64
	UpdatedAt   int64
	Users       []*UserResult
	RoleIDs     []string
}
