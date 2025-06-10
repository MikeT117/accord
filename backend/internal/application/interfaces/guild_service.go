package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type GuildService interface {
	GetByID(ctx context.Context, ID string) (*query.GuildQueryResult, error)
	GetByUserID(ctx context.Context, userID string) (*query.GuildQueryListResult, error)
	Create(ctx context.Context, createCommand *command.CreateGuildCommand) error
	Update(ctx context.Context, updateCommand *command.UpdateGuildCommand) error
	Delete(ctx context.Context, ID string, userID string) error
}
