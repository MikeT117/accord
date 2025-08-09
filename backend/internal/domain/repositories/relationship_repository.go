package repositories

import (
	"context"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

type RelationshipRepository interface {
	GetByID(ctx context.Context, ID uuid.UUID) (*entities.Relationship, error)
	GetByUserID(ctx context.Context, userID uuid.UUID, status int8, before time.Time, limit int8) ([]*entities.Relationship, []uuid.UUID, error)
	GetByUserIDAndUserIDs(ctx context.Context, userID uuid.UUID, userIDs []uuid.UUID) ([]*entities.Relationship, error)
	GetUserIDsByID(ctx context.Context, ID uuid.UUID) ([]uuid.UUID, error)
	Create(ctx context.Context, validatedRelationship *entities.Relationship) error
	Update(ctx context.Context, validatedRelationship *entities.Relationship) error
	Delete(ctx context.Context, ID uuid.UUID, creatorID uuid.UUID) error
}
