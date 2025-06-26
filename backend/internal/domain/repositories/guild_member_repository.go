package repositories

import (
	"context"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type GuildMemberRepository interface {
	GetByID(ctx context.Context, userID string, guildID string) (*entities.GuildMember, error)
	GetMapByIDs(ctx context.Context, IDs []string, guildID string) (map[string]*entities.GuildMember, error)
	GetByGuildID(ctx context.Context, guildID string, before time.Time, limit int) ([]*entities.GuildMember, []string, error)
	GetMapByUserID(ctx context.Context, userID string) (map[string]*entities.GuildMember, []string, error)
	GetGuildIDsByUserID(ctx context.Context, userID string) ([]string, error)
	Create(ctx context.Context, guildMember *entities.GuildMember) error
	Update(ctx context.Context, guildMember *entities.GuildMember) error
	Delete(ctx context.Context, userID string, guildID string) error
}
