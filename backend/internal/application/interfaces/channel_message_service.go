package interfaces

import (
	"context"
	"time"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type ChannelMessageService interface {
	GetByID(ctx context.Context, ID string, channelID string, requestorID string) (*query.ChannelMessageQueryResult, error)
	GetByChannelID(ctx context.Context, channelID string, pinned bool, before time.Time, requestorID string) (*query.ChannelMessageQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateChannelMessageCommand, requestorID string) error
	Update(ctx context.Context, cmd *command.UpdateChannelMessageCommand, requestorID string) error
	Delete(ctx context.Context, cmd *command.DeleteChannelMessageCommand, requestorID string) error
}
