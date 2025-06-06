package command

import "github.com/MikeT117/accord/backend/internal/application/common"

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

type CreateChannelCommandResult struct {
	Result *common.ChannelResult
}
