package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type AttachmentService interface {
	Create(ctx context.Context, cmd *command.CreateAttachmentCommand) error
	Update(ctx context.Context, cmd *command.UpdateAttachmentCommand) error
	Delete(ctx context.Context, ID string) error
}
