package entities

import (
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

const (
	UPLOAD_PENDING = iota
	UPLOAD_SUCCESS
	UPLOAD_FAILED
)

type Attachment struct {
	ID           uuid.UUID
	Filename     string
	ResourceType string
	OwnerID      uuid.UUID
	Height       *int64
	Width        *int64
	Filesize     int64
	CreatedAt    time.Time
	UpdatedAt    time.Time
	Status       int8
}

func (u *Attachment) validate() error {
	if u.ID == uuid.Nil {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if strings.Trim(u.Filename, " ") == "" {
		return domain.NewDomainValidationError("filename must not be empty")
	}
	if strings.Trim(u.ResourceType, " ") == "" {
		return domain.NewDomainValidationError("resourceType must not be empty")
	}
	if u.OwnerID == uuid.Nil {
		return domain.NewDomainValidationError("owner id must not be empty")
	}
	if u.Status != UPLOAD_PENDING && u.Status != UPLOAD_SUCCESS && u.Status != UPLOAD_FAILED {
		return domain.NewDomainValidationError("invalid upload status")
	}
	return nil
}

func NewAttachment(filename string, resourceType string, ownerID uuid.UUID, filesize int64) (*Attachment, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
	attachment := &Attachment{
		ID:           ID,
		Filename:     filename,
		ResourceType: resourceType,
		OwnerID:      ownerID,
		Height:       nil,
		Width:        nil,
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

func (a *Attachment) UpdateStatus(status int8) error {
	a.Status = status
	a.UpdatedAt = time.Now().UTC()
	return a.validate()
}

func (a *Attachment) UpdateDimensions(height *int64, width *int64) error {
	a.Height = height
	a.Width = width
	a.UpdatedAt = time.Now().UTC()
	return a.validate()
}
