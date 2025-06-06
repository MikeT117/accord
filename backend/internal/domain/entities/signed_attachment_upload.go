package entities

import (
	"fmt"
	"os"
)

type SignedAttachmentUpload struct {
	ID        string
	UploadURL string
}

func NewSignedAttachmentUpload(ID string, signature string, timestamp int64) *SignedAttachmentUpload {

	uploadURL := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/auto/upload?api_key=%s&signature=%s&timestamp=%d&public_id=%s",
		os.Getenv("CLOUDINARY_ENVIRONMENT"),
		os.Getenv("CLOUDINARY_API_KEY"),
		signature,
		timestamp,
		ID,
	)

	return &SignedAttachmentUpload{
		ID:        ID,
		UploadURL: uploadURL,
	}
}
