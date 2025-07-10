package repositories

import (
	"context"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type RelationshipRepository interface {
	GetByID(ctx context.Context, ID string) (*entities.Relationship, error)
	GetByUserID(ctx context.Context, userID string, status int8, before time.Time, limit int8) ([]*entities.Relationship, []string, error)
	GetByUserIDAndUserIDs(ctx context.Context, userID string, userIDs []string) ([]*entities.Relationship, error)
	GetUserIDsByID(ctx context.Context, ID string) ([]string, error)
	Create(ctx context.Context, validatedRelationship *entities.Relationship) error
	Update(ctx context.Context, validatedRelationship *entities.Relationship) error
	Delete(ctx context.Context, ID string, creatorID string) error
}
