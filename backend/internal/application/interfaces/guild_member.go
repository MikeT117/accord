package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type GuildMemberService interface {
	GetByID(ctx context.Context, qry *query.GuildMemberQuery) (*query.GuildMemberQueryResult, error)
	GetByGuildID(ctx context.Context, qry *query.GuildMembersQuery) (*query.GuildMemberQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateGuildMemberCommand) error
	Update(ctx context.Context, cmd *command.UpdateGuildMemberCommand) error
	Delete(ctx context.Context, cmd *command.DeleteGuildMemberCommand) error
}
