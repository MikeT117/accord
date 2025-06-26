package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type RelationshipService interface {
	GetByID(ctx context.Context, ID string, userID string) (*query.RelationshipQueryResult, error)
	GetByUserID(ctx context.Context, userID string) (*query.RelationshipQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateRelationshipCommand) error
	Update(ctx context.Context, cmd *command.UpdateRelationshipCommand) error
	Delete(ctx context.Context, cmd *command.DeleteRelationshipCommand) error
}
