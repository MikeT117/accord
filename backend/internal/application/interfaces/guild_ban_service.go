package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/google/uuid"
)

type GuildBanService interface {
	GetByGuildID(ctx context.Context, guildID uuid.UUID, requestorID uuid.UUID) (*query.GuildBanQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateGuildBanCommand) error
	Delete(ctx context.Context, cmd *command.DeleteGuildBanCommand) error
}
