package command

type CreateChannelCommand struct {
	ChannelType int8
	GuildID     *string
	CreatorID   *string
	Name        *string
	Topic       *string
	IsPrivate   bool
	Roles       *[]string
	Users       *[]string
}
