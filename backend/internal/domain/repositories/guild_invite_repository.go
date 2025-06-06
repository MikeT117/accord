package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type GuildInviteRepository interface {
	GetByID(context context.Context, ID string) (*entities.GuildInvite, error)
	GetByGuildID(context context.Context, guildID string) ([]*entities.GuildInvite, error)
	Create(context context.Context, validatedGuildInvite *entities.ValidatedGuildInvite) (*entities.GuildInvite, error)
	Delete(context context.Context, ID string) error
}
