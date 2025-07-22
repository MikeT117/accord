package command

type CreateChannelCommand struct {
	ChannelType int8
	GuildID     *string
	CreatorID   string
	IsPrivate   bool
	Name        *string
	Topic       *string
	RoleIDs     []string
	UserIDs     []string
}
