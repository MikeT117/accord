package command

type CreateAttachmentCommand struct {
	ResourceType string
	OwnerID      string
	Height       *int64
	Width        *int64
	Filesize     int64
}
