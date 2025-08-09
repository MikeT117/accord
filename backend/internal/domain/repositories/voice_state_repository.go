package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

type VoiceStateRepository interface {
	GetByID(ctx context.Context, ID uuid.UUID) (*entities.VoiceState, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) (*entities.VoiceState, error)
	GetByChannelID(ctx context.Context, channelID uuid.UUID) ([]*entities.VoiceState, error)
	GetByGuildID(ctx context.Context, guildID uuid.UUID) ([]*entities.VoiceState, []uuid.UUID, error)
	Create(ctx context.Context, validatedVoiceState *entities.VoiceState) error
	Update(ctx context.Context, validatedVoiceState *entities.VoiceState) error
	Delete(ctx context.Context, ID uuid.UUID) error
}
