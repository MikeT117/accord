package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

type GuildInviteRepository interface {
	GetByID(ctx context.Context, ID uuid.UUID) (*entities.GuildInvite, error)
	GetByGuildID(ctx context.Context, guildID uuid.UUID) ([]*entities.GuildInvite, error)
	Create(ctx context.Context, validatedGuildInvite *entities.GuildInvite) error
	Delete(ctx context.Context, ID uuid.UUID) error
}
