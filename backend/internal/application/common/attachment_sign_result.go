package common

import "time"

type AttachmentSignResult struct {
	ID        string
	Signature string
	CreatedAt time.Time
}
