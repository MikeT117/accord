package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type GuildService interface {
	Create(ctx context.Context, cmd *command.CreateGuildCommand) error
	Update(ctx context.Context, cmd *command.UpdateGuildCommand) error
	Delete(ctx context.Context, cmd *command.DeleteGuildCommand) error
}
