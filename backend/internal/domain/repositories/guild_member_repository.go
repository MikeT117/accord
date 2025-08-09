package repositories

import (
	"context"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

type GuildMemberRepository interface {
	GetByID(ctx context.Context, userID uuid.UUID, guildID uuid.UUID) (*entities.GuildMember, error)
	GetMapByIDs(ctx context.Context, IDs []uuid.UUID, guildID uuid.UUID) (map[uuid.UUID]*entities.GuildMember, error)
	GetByGuildID(ctx context.Context, guildID uuid.UUID, before time.Time, limit int) ([]*entities.GuildMember, []uuid.UUID, error)
	GetMapByUserID(ctx context.Context, userID uuid.UUID) (map[uuid.UUID]*entities.GuildMember, []uuid.UUID, error)
	GetGuildIDsByUserID(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error)
	GetUnassignedByGuildIDAndRoleID(ctx context.Context, guildID uuid.UUID, roleID uuid.UUID, before time.Time, limit int) ([]*entities.GuildMember, []uuid.UUID, error)
	GetAssignedByGuildIDAndRoleID(ctx context.Context, guildID uuid.UUID, roleID uuid.UUID, before time.Time, limit int) ([]*entities.GuildMember, []uuid.UUID, error)
	Create(ctx context.Context, guildMember *entities.GuildMember) error
	Update(ctx context.Context, guildMember *entities.GuildMember) error
	Delete(ctx context.Context, userID uuid.UUID, guildID uuid.UUID) error
}
