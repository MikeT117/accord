package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type RelationshipRepository interface {
	GetByID(context context.Context, ID string) (*entities.Relationship, error)
	GetByUserID(context context.Context, userID string) ([]*entities.Relationship, error)
	Create(context context.Context, validatedRelationship *entities.ValidatedRelationship) (*entities.Relationship, error)
	Update(context context.Context, validatedRelationship *entities.ValidatedRelationship) (*entities.Relationship, error)
	Delete(context context.Context, ID string) error
}
