package interfaces

import (
	"context"
	"time"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type GuildMemberService interface {
	GetByID(ctx context.Context, ID string, guildID string, requestorID string) (*query.GuildMemberQueryResult, error)
	GetByGuildID(ctx context.Context, guildID string, before time.Time, requestorID string) (*query.GuildMemberQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateGuildMemberCommand) error
	Update(ctx context.Context, cmd *command.UpdateGuildMemberCommand, requestorID string) error
	Delete(ctx context.Context, ID string, guildID string, requestorID string) error
}
