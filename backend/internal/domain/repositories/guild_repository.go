package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type GuildRepository interface {
	GetByID(ctx context.Context, ID string) (*entities.Guild, error)
	GetByGuildIDs(ctx context.Context, guildIDs []string) ([]*entities.Guild, error)
	Create(ctx context.Context, validatedGuild *entities.Guild) error
	Update(ctx context.Context, validatedGuild *entities.Guild) error
	Delete(ctx context.Context, ID string) error
}
