package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/google/uuid"
)

type GuildCategoryService interface {
	GetAll(ctx context.Context) (*query.GuildCategoryQueryListResult, error)
	GetByID(ctx context.Context, ID uuid.UUID) (*query.GuildCategoryQueryResult, error)
	Create(ctx context.Context, createCommand *command.CreateGuildCategoryCommand) error
}
