package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type GuildInviteService interface {
	GetByID(ctx context.Context, ID string) (*query.GuildInviteQueryResult, error)
	GetByGuildID(ctx context.Context, guildID string, requestorID string) (*query.GuildInviteQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateGuildInviteCommand, requestorID string) error
	Delete(ctx context.Context, ID string, guildID string, requestorID string) error
}
