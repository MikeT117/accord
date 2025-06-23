package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type ChannelService interface {
	GetByGuildID(ctx context.Context, guildID string, requestorID string) (*query.ChannelQueryListResult, error)
	GetByUserID(ctx context.Context, userID string) (*query.ChannelQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateChannelCommand, requestorID string) error
	Update(ctx context.Context, cmd *command.UpdateChannelCommand, requestorID string) error
	Delete(ctx context.Context, ID string, requestorID string) error
	AssociateUser(ctx context.Context, channelID, userID string, requestorID string) error
	DisassociateUser(ctx context.Context, channelID, userID string, requestorID string) error
}
