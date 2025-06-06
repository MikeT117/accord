package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type GuildBanRepository interface {
	GetByID(context context.Context, ID string) (*entities.GuildBan, error)
	GetByGuildID(context context.Context, guildID string) ([]*entities.GuildBan, error)
	Create(context context.Context, validatedGuildBan *entities.ValidatedGuildBan) (*entities.GuildBan, error)
	Delete(context context.Context, ID string) error
}
