package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type GuildBanService interface {
	GetByGuildID(ctx context.Context, guildID string, requestorID string) (*query.GuildBanQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateGuildBanCommand, requestorID string) error
	Delete(ctx context.Context, ID string, guildID string, requestorID string) error
}
