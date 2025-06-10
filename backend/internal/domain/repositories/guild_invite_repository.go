package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type GuildInviteRepository interface {
	GetByID(ctx context.Context, ID string) (*entities.GuildInvite, error)
	GetByGuildID(ctx context.Context, guildID string) ([]*entities.GuildInvite, error)
	Create(ctx context.Context, validatedGuildInvite *entities.GuildInvite) error
	Delete(ctx context.Context, ID string) error
}
