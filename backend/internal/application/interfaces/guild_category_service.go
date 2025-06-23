package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type GuildCategoryService interface {
	GetByID(ctx context.Context, ID string) (*query.GuildCategoryQueryResult, error)
	Create(ctx context.Context, createCommand *command.CreateGuildCategoryCommand) error
}
