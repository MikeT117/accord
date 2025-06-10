package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type GuildMemberService interface {
	GetByID(ctx context.Context, ID string, guildID string) (*query.GuildMemberQueryResult, error)
	GetByGuildID(ctx context.Context, guildID string) (*query.GuildMemberQueryListResult, error)
	Create(ctx context.Context, createCommand *command.CreateGuildMemberCommand) error
	Update(ctx context.Context, updateCommand *command.UpdateGuildMemberCommand) error
	Delete(ctx context.Context, ID string, guildID string) error
}
