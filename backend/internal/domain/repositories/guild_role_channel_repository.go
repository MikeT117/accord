package repositories

import (
	"context"
)

type GuildRoleChannelRepository interface {
	CreateAssoc(context context.Context, roleID string, userID string) error
	DeleteAssoc(context context.Context, roleID string, userID string) error
	GetRoleIDsByChannelIDs(context context.Context, channelIDs []string) (map[string][]string, error)
	GetRoleIDsByChannelID(context context.Context, channelID string) ([]string, error)
}
