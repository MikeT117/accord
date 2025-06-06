package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type GuildMemberRepository interface {
	GetByID(context context.Context, ID string, guildID string) (*entities.GuildMember, error)
	GetByGuildID(context context.Context, guildID string) ([]*entities.GuildMember, []string, error)
	GetByUserID(context context.Context, userID string) (map[string]*entities.GuildMember, []string, error)
	GetGuildIDsByUserID(context context.Context, userID string) ([]string, error)
	Create(context context.Context, validatedGuildMember *entities.ValidatedGuildMember) (*entities.GuildMember, error)
	Update(context context.Context, validatedGuildMember *entities.ValidatedGuildMember) (*entities.GuildMember, error)
	Delete(context context.Context, ID string) error
}
