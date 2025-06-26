package command

import "github.com/MikeT117/accord/backend/internal/application/common"

type CreateAttachmentCommand struct {
	ResourceType string
	OwnerID      string
	Height       *int64
	Width        *int64
	Filesize     int64
}

type CreateAttachmentCommandResult struct {
	Result *common.AttachmentSignResult
}
