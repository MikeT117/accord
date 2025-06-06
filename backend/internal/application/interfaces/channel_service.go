package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type ChannelService interface {
	GetByID(context context.Context, ID string) (*query.ChannelQueryResult, error)
	GetByGuildID(context context.Context, guildID string) (*query.ChannelQueryListResult, error)
	GetByUserID(context context.Context, userID string) (*query.ChannelQueryListResult, error)
	Create(context context.Context, createCommand *command.CreateChannelCommand) (*command.CreateChannelCommandResult, error)
	Update(context context.Context, createCommand *command.UpdateChannelCommand) (*command.CreateChannelCommandResult, error)
	Delete(context context.Context, ID string) error
}
