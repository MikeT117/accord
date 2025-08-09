package response

import "github.com/google/uuid"

type AttachmentSignResponse struct {
	ID        uuid.UUID `json:"id"`
	Signature string    `json:"signature"`
	Timestamp int64     `json:"timestamp"`
}
