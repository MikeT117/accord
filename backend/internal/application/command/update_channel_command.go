package command

import "github.com/MikeT117/accord/backend/internal/application/common"

type UpdateChannelCommand struct {
	ID       string
	ParentID *string
	Name     string
	Topic    *string
}

type UpdateChannelCommandResult struct {
	Result *common.ChannelResult
}
