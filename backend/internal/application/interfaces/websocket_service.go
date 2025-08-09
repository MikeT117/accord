package interfaces

import (
	"context"

	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	"github.com/google/uuid"
)

type WebsocketService interface {
	GetInitialisationPayload(ctx context.Context, userID uuid.UUID) (*pb.Initialisation, error)
	GetUserRoleIDs(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error)
	ValidateSession(ctx context.Context, token string) (bool, error)
}
