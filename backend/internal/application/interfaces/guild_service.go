package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type GuildService interface {
	GetByUserID(context context.Context, userID string) (*query.GuildQueryListResult, error)
	Create(context context.Context, createCommand *command.CreateGuildCommand) (*command.CreateGuildCommandResult, error)
	Update(context context.Context, updateCommand *command.UpdateGuildCommand) error
	Delete(context context.Context, ID string, userID string) error
}
