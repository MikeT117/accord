package entities

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

const (
	PENDING = iota
	FRIEND
	BLOCKED
)

type Relationship struct {
	ID          string
	CreatorID   string
	RecipientID string
	Status      int8
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (u *Relationship) validate(isNew bool) error {
	if u.ID == "" {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if u.CreatorID == "" {
		return domain.NewDomainValidationError("creator id must not be empty")
	}
	if u.RecipientID == "" {
		return domain.NewDomainValidationError("recipient id must not be empty")
	}
	if u.Status != PENDING && u.Status != FRIEND && u.Status != BLOCKED {
		return domain.NewDomainValidationError("invalid relationship status")
	}
	if isNew && u.Status != PENDING && u.Status != BLOCKED {
		return domain.NewDomainValidationError("invalid relationship status")
	}
	if !isNew && u.Status != FRIEND && u.Status != BLOCKED {
		return domain.NewDomainValidationError("invalid relationship status")
	}

	return nil
}

func (r *Relationship) IsBlocked() bool {
	return r.Status == BLOCKED
}

func (r *Relationship) IsPending() bool {
	return r.Status == PENDING
}

func (r *Relationship) IsFriend() bool {
	return r.Status == FRIEND
}

func (r *Relationship) IsCreator(creatorID string) bool {
	return r.CreatorID == creatorID
}

func NewRelationship(creatorID string, status int8, recipientID string) (*Relationship, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()

	relationship := &Relationship{
		ID:          ID.String(),
		CreatorID:   creatorID,
		RecipientID: recipientID,
		Status:      status,
		CreatedAt:   timestamp,
		UpdatedAt:   timestamp,
	}

	if err := relationship.validate(true); err != nil {
		return nil, err
	}

	return relationship, nil
}

func (r *Relationship) Updatestatus(status int8) error {
	r.UpdatedAt = time.Now().UTC()
	r.Status = status
	return r.validate(false)
}
