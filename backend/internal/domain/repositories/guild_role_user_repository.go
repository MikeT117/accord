package repositories

import (
	"context"
)

type GuildRoleUserRepository interface {
	CreateAssoc(context context.Context, roleID string, userID string) error
	DeleteAssoc(context context.Context, roleID string, userID string) error
	GetAssocsByUserIDs(context context.Context, userIDs []string) (map[string][]string, error)
	GetAssocsByUserIDAndGuildID(context context.Context, userID string, guildID string) ([]string, error)
}
