package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/google/uuid"
)

type RelationshipService interface {
	GetByID(ctx context.Context, ID uuid.UUID, userID uuid.UUID) (*query.RelationshipQueryResult, error)
	Create(ctx context.Context, cmd *command.CreateRelationshipCommand) error
	Update(ctx context.Context, cmd *command.UpdateRelationshipCommand) error
	Delete(ctx context.Context, cmd *command.DeleteRelationshipCommand) error
}
