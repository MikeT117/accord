package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type GuildCategoryRepository interface {
	Get(context context.Context, ID string) ([]*entities.GuildCategory, error)
	Create(context context.Context, ValidatedGuildCategory *entities.ValidatedGuildCategory) (*entities.GuildCategory, error)
	Delete(context context.Context, ID string) error
}
