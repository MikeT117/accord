package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

type GuildRepository interface {
	GetByID(ctx context.Context, ID uuid.UUID) (*entities.Guild, error)
	GetByGuildIDs(ctx context.Context, guildIDs []uuid.UUID) ([]*entities.Guild, error)
	Create(ctx context.Context, validatedGuild *entities.Guild) error
	Update(ctx context.Context, validatedGuild *entities.Guild) error
	Delete(ctx context.Context, ID uuid.UUID) error
}
