package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type GuildCategoryRepository interface {
	Get(ctx context.Context, ID string) ([]*entities.GuildCategory, error)
	Create(ctx context.Context, GuildCategory *entities.GuildCategory) error
	Delete(ctx context.Context, ID string) error
}
