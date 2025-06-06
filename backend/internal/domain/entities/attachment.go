package entities

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Attachment struct {
	ID            string
	ResourceType  string
	Signature     string
	UnixTimestamp int64
	OwnerID       string
	Height        *int64
	Width         *int64
	FileSize      int64
	CreatedAt     int64
	UpdatedAt     int64
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
	if u.UnixTimestamp != 0 {
		return errors.New("unix timestamp id must not be empty")
	}
	if strings.Trim(u.OwnerID, " ") == "" {
		return errors.New("owner id must not be empty")
	}
	return nil
}

func NewAttachment(resourceType string, signature string, unixTimestamp int64, ownerID string, height *int64, width *int64, fileSize int64) (*Attachment, error) {
	id, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	return &Attachment{
		ID:            id.String(),
		ResourceType:  resourceType,
		Signature:     signature,
		UnixTimestamp: unixTimestamp,
		OwnerID:       ownerID,
		Height:        height,
		Width:         width,
		FileSize:      fileSize,
		CreatedAt:     timestamp,
		UpdatedAt:     timestamp,
	}, nil
}
