package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

type GuildCategoryRepository interface {
	GetAll(ctx context.Context) ([]*entities.GuildCategory, error)
	GetByID(ctx context.Context, ID uuid.UUID) (*entities.GuildCategory, error)
	Create(ctx context.Context, GuildCategory *entities.GuildCategory) error
	Delete(ctx context.Context, ID uuid.UUID) error
}
