package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type ChannelService interface {
	GetByGuildID(ctx context.Context, guildID string, requestorID string) (*query.ChannelQueryListResult, error)
	GetByUserID(ctx context.Context, userID string) (*query.ChannelQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateChannelCommand) error
	Update(ctx context.Context, cmd *command.UpdateChannelCommand) error
	Delete(ctx context.Context, cmd *command.DeleteChannelCommand) error
	CreateUserAssoc(ctx context.Context, cmd *command.CreateUserChannelAssociationCommand) error
	DeleteUserAssoc(ctx context.Context, cmd *command.DeleteUserChannelAssociationCommand) error
}
