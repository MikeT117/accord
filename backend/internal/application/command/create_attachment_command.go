package command

import "github.com/MikeT117/accord/backend/internal/application/common"

type CreateAttachmentCommand struct {
	Filename     string
	ResourceType string
	OwnerID      string
	Filesize     int64
}

type CreateAttachmentCommandResult struct {
	Result *common.AttachmentSignResult
}
