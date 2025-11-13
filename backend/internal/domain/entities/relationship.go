package entities

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/constants"
	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

type Relationship struct {
	ID          uuid.UUID
	CreatorID   uuid.UUID
	RecipientID uuid.UUID
	Status      int8
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (u *Relationship) validate(isNew bool) error {
	if u.ID == uuid.Nil {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if u.CreatorID == uuid.Nil {
		return domain.NewDomainValidationError("creator id must not be empty")
	}
	if u.RecipientID == uuid.Nil {
		return domain.NewDomainValidationError("recipient id must not be empty")
	}
	if u.Status != constants.PENDING_RELATIONSHIP && u.Status != constants.FRIEND_RELATIONSHIP && u.Status != constants.BLOCKED_RELATIONSHIP {
		return domain.NewDomainValidationError("invalid relationship status")
	}
	if isNew && u.Status != constants.PENDING_RELATIONSHIP && u.Status != constants.BLOCKED_RELATIONSHIP {
		return domain.NewDomainValidationError("invalid relationship status")
	}
	if !isNew && u.Status != constants.FRIEND_RELATIONSHIP && u.Status != constants.BLOCKED_RELATIONSHIP {
		return domain.NewDomainValidationError("invalid relationship status")
	}

	return nil
}

func (r *Relationship) IsBlocked() bool {
	return r.Status == constants.BLOCKED_RELATIONSHIP
}

func (r *Relationship) IsPending() bool {
	return r.Status == constants.PENDING_RELATIONSHIP
}

func (r *Relationship) IsFriend() bool {
	return r.Status == constants.FRIEND_RELATIONSHIP
}

func (r *Relationship) IsCreator(creatorID uuid.UUID) bool {
	return r.CreatorID == creatorID
}

func NewRelationship(creatorID uuid.UUID, status int8, recipientID uuid.UUID) (*Relationship, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()

	relationship := &Relationship{
		ID:          ID,
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
