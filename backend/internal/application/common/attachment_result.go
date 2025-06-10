package common

type AttachmentResult struct {
	ID           string
	ResourceType string
	Signature    string
	OwnerID      string
	Height       *int64
	Width        *int64
	Filesize     int64
	CreatedAt    int64
	UpdatedAt    int64
}
