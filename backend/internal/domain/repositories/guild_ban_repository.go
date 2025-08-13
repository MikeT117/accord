package repositories

import (
	"context"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

type GuildBanRepository interface {
	GetByGuildID(ctx context.Context, guildID uuid.UUID, before time.Time, limit int) ([]*entities.GuildBan, []uuid.UUID, error)
	Create(ctx context.Context, guildBan *entities.GuildBan) error
	Delete(ctx context.Context, userID uuid.UUID, guildID uuid.UUID) error
}
