package command

import "github.com/google/uuid"

type CreateChannelCommand struct {
	ChannelType int8
	GuildID     *uuid.UUID
	CreatorID   uuid.UUID
	IsPrivate   bool
	Name        *string
	Topic       *string
	RoleIDs     []uuid.UUID
	UserIDs     []uuid.UUID
}
