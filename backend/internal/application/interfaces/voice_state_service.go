package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type VoiceStateService interface {
	GetByGuildID(ctx context.Context, guildID string, requestorID string) (*query.VoiceStateQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateVoiceStateCommand, requestorID string) error
	Update(ctx context.Context, cmd *command.UpdateVoiceStateCommand, guildID string, requestorID string) error
	Delete(ctx context.Context, ID string, requestorID string) error
}
