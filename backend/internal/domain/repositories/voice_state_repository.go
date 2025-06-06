package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type VoiceStateRepository interface {
	GetByUserID(context context.Context, userID string) (*entities.VoiceState, error)
	GetByChannelID(context context.Context, channelID string) ([]*entities.VoiceState, error)
	GetByGuildID(context context.Context, guildID string) ([]*entities.VoiceState, error)
	Create(context context.Context, validatedVoiceState *entities.ValidatedVoiceState) (*entities.VoiceState, error)
	Update(context context.Context, validatedVoiceState *entities.ValidatedVoiceState) (*entities.VoiceState, error)
	Delete(context context.Context, userID string, channelID string) error
}
