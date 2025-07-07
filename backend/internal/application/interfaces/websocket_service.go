package interfaces

import (
	"context"

	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
)

type WebsocketService interface {
	GetInitialisationPayload(ctx context.Context, userID string) (*pb.Initialisation, error)
	GetUserRoleIDs(ctx context.Context, userID string) ([]string, error)
	ValidateSession(ctx context.Context, token string) (bool, error)
}
