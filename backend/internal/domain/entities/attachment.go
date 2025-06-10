package entities

import (
	"crypto/sha1"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
)

const (
	UPLOAD_PENDING = iota
	UPLOAD_SUCCESS
	UPLOAD_FAILED
)

type Attachment struct {
	ID           string
	ResourceType string
	Signature    string
	OwnerID      string
	Height       *int64
	Width        *int64
	Filesize     int64
	CreatedAt    int64
	UpdatedAt    int64
	Status       int8
}

func (u *Attachment) validate() error {
	if strings.Trim(u.ID, " ") == "" {
		return errors.New("id must not be empty")
	}
	if strings.Trim(u.ResourceType, " ") == "" {
		return errors.New("resourceType must not be empty")
	}
	if strings.Trim(u.Signature, " ") == "" {
		return errors.New("signature must not be empty")
	}
	if u.CreatedAt != 0 {
		return errors.New("createdAt must not be empty")
	}
	if strings.Trim(u.OwnerID, " ") == "" {
		return errors.New("owner id must not be empty")
	}
	if u.Status != UPLOAD_PENDING && u.Status != UPLOAD_SUCCESS && u.Status != UPLOAD_FAILED {
		return errors.New("invalid upload status")
	}
	return nil
}

func NewAttachment(resourceType string, ownerID string, height *int64, width *int64, filesize int64) (*Attachment, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	hash := sha1.New()
	hash.Write([]byte(fmt.Sprintf("public_id=%s&timestamp=%d%s", ID, timestamp, os.Getenv("CLOUDINARY_SECRET"))))
	signature := hex.EncodeToString(hash.Sum(nil))

	attachment := &Attachment{
		ID:           ID.String(),
		ResourceType: resourceType,
		Signature:    signature,
		OwnerID:      ownerID,
		Height:       height,
		Width:        width,
		Filesize:     filesize,
		CreatedAt:    timestamp,
		UpdatedAt:    timestamp,
		Status:       UPLOAD_PENDING,
	}

	if err := attachment.validate(); err != nil {
		return nil, err
	}

	return attachment, nil
}

func (a *Attachment) SignedURL(ID string, signature string, timestamp int64) string {
	return fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/auto/upload?api_key=%s&Signature=%s&timestamp=%d&public_id=%s",
		os.Getenv("CLOUDINARY_ENVIRONMENT"),
		os.Getenv("CLOUDINARY_API_KEY"),
		a.Signature,
		a.CreatedAt,
		a.ID,
	)
}

func (a *Attachment) UpdateStatus(status int8) error {
	a.Status = status
	a.UpdatedAt = time.Now().UTC().Unix()

	return a.validate()
}
