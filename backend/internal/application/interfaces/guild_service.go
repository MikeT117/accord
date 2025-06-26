package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type GuildService interface {
	GetByUserID(ctx context.Context, userID string) (*query.GuildQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateGuildCommand) error
	Update(ctx context.Context, cmd *command.UpdateGuildCommand) error
	Delete(ctx context.Context, cmd *command.DeleteGuildCommand) error
}
