package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type GuildRoleRepository interface {
	GetByID(context context.Context, ID string) (*entities.GuildRole, error)
	GetByGuildID(context context.Context, guildID string) ([]*entities.GuildRole, []string, error)
	GetByGuildIDs(context context.Context, guildIDs []string) (map[string][]*entities.GuildRole, []string, error)
	GetByNameAndGuildID(context context.Context, name string, guildID string) (*entities.GuildRole, error)
	Create(context context.Context, validatedGuild *entities.ValidatedGuildRole) (*entities.GuildRole, error)
	Update(context context.Context, validatedGuild *entities.ValidatedGuildRole) (*entities.GuildRole, error)
	Delete(context context.Context, ID string) error
}
