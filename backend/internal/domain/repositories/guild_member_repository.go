package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type GuildMemberRepository interface {
	GetByID(ctx context.Context, ID string, guildID string) (*entities.GuildMember, error)
	GetByIDs(ctx context.Context, IDs []string, guildID string) (map[string]*entities.GuildMember, error)
	GetByGuildID(ctx context.Context, guildID string) ([]*entities.GuildMember, []string, error)
	GetByUserID(ctx context.Context, userID string) (map[string]*entities.GuildMember, []string, error)
	GetGuildIDsByUserID(ctx context.Context, userID string) ([]string, error)
	Create(ctx context.Context, validatedGuildMember *entities.GuildMember) error
	Update(ctx context.Context, validatedGuildMember *entities.GuildMember) error
	Delete(ctx context.Context, ID string) error
}
