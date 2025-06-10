package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type GuildBanService interface {
	GetByUserIDAndGuildID(ctx context.Context, userID string, guildID string) (*query.GuildBanQueryResult, error)
	GetByGuildID(ctx context.Context, guildID string) (*query.GuildBanQueryListResult, error)
	Create(ctx context.Context, createCommand *command.CreateGuildBanCommand) error
	Delete(ctx context.Context, userID string, guildID string) error
}
