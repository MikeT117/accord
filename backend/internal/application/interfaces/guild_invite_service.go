package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type GuildInviteService interface {
	GetByID(ctx context.Context, qry *query.GuildInviteQuery) (*query.GuildInviteQueryResult, error)
	GetByGuildID(ctx context.Context, qry *query.GuildInvitesQuery) (*query.GuildInviteQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateGuildInviteCommand) (*command.CreateGuildInviteCommandResult, error)
	Delete(ctx context.Context, cmd *command.DeleteGuildInviteCommand) error
}
