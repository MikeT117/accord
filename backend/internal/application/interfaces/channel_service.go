package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type ChannelService interface {
	GetByID(ctx context.Context, ID string) (*query.ChannelQueryResult, error)
	GetByGuildID(ctx context.Context, guildID string) (*query.ChannelQueryListResult, error)
	GetByUserID(ctx context.Context, userID string) (*query.ChannelQueryListResult, error)
	Create(ctx context.Context, createCommand *command.CreateChannelCommand) error
	Update(ctx context.Context, createCommand *command.UpdateChannelCommand) error
	Delete(ctx context.Context, ID string) error
}
