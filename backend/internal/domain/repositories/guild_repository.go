package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type GuildRepository interface {
	GetByID(context context.Context, ID string) (*entities.Guild, error)
	GetByGuildIDs(context context.Context, guildIDs []string) ([]*entities.Guild, error)
	Create(context context.Context, validatedGuild *entities.ValidatedGuild) (*entities.Guild, error)
	Update(context context.Context, validatedGuild *entities.ValidatedGuild) (*entities.Guild, error)
	Delete(context context.Context, ID string) error
}
