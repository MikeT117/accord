package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type ChannelMessageService interface {
	GetByID(ctx context.Context, qry *query.ChannelMessageQuery) (*query.ChannelMessageQueryResult, error)
	GetByChannelID(ctx context.Context, qry *query.ChannelMessagesQuery) (*query.ChannelMessageQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateChannelMessageCommand) error
	Update(ctx context.Context, cmd *command.UpdateChannelMessageCommand) error
	Delete(ctx context.Context, cmd *command.DeleteChannelMessageCommand) error
	PinMessage(ctx context.Context, cmd *command.CreateChannelPinCommand) error
	UnpinMessage(ctx context.Context, cmd *command.DeleteChannelPinCommand) error
}
