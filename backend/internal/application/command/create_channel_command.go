package command

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/google/uuid"
)

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

type CreateChannelCommandResult struct {
	Result *common.ChannelResult
}
