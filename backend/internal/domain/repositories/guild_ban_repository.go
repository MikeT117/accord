package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type GuildBanRepository interface {
	GetByGuildID(ctx context.Context, guildID string) ([]*entities.GuildBan, []string, error)
	Create(ctx context.Context, guildBan *entities.GuildBan) error
	Delete(ctx context.Context, ID string) error
}
