package command

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/google/uuid"
)

type CreateAttachmentCommand struct {
	Filename     string
	ResourceType string
	OwnerID      uuid.UUID
	Filesize     int64
}

type CreateAttachmentCommandResult struct {
	Result *common.AttachmentSignResult
}
