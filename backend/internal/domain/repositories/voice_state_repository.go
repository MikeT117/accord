package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type VoiceStateRepository interface {
	GetByID(ctx context.Context, ID string) (*entities.VoiceState, error)
	GetByUserID(ctx context.Context, userID string) (*entities.VoiceState, error)
	GetByChannelID(ctx context.Context, channelID string) ([]*entities.VoiceState, error)
	GetByGuildID(ctx context.Context, guildID string) ([]*entities.VoiceState, []string, error)
	Create(ctx context.Context, validatedVoiceState *entities.VoiceState) error
	Update(ctx context.Context, validatedVoiceState *entities.VoiceState) error
	Delete(ctx context.Context, ID string) error
}
