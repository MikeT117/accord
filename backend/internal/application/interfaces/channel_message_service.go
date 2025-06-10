package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type ChannelMessageService interface {
	GetByID(ctx context.Context, ID string) (*query.ChannelMessageQueryResult, error)
	GetByChannelID(ctx context.Context, channelID string) (*query.ChannelMessageQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateChannelMessageCommand) error
	Update(ctx context.Context, cmd *command.UpdateChannelMessageCommand) error
	Delete(ctx context.Context, ID string) error
}
