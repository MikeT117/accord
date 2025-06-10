package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type VoiceStateRepository interface {
	GetByUserID(ctx context.Context, userID string) (*entities.VoiceState, error)
	GetByChannelID(ctx context.Context, channelID string) ([]*entities.VoiceState, error)
	GetByGuildID(ctx context.Context, guildID string) ([]*entities.VoiceState, error)
	Create(ctx context.Context, validatedVoiceState *entities.VoiceState) error
	Update(ctx context.Context, validatedVoiceState *entities.VoiceState) error
	Delete(ctx context.Context, userID string, channelID string) error
}
