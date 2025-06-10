package entities

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

const (
	PENDING = iota
	FRIENDS
	BLOCKED
)

type Relationship struct {
	ID          string
	CreatorID   string
	RecipientID string
	Status      int8
	CreatedAt   int64
	UpdatedAt   int64
}

func (u *Relationship) validate() error {
	if u.ID == "" {
		return errors.New("id must not be empty")
	}
	if u.CreatorID == "" {
		return errors.New("creator id must not be empty")
	}
	if u.RecipientID == "" {
		return errors.New("recipient id must not be empty")
	}
	if u.Status != PENDING && u.Status != FRIENDS && u.Status != BLOCKED {
		return errors.New("invalid relationship status")
	}
	return nil
}

func NewRelationship(creatorID string, status int8, recipientID string) (*Relationship, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	relationship := &Relationship{
		ID:          ID.String(),
		CreatorID:   creatorID,
		RecipientID: recipientID,
		Status:      status,
		CreatedAt:   timestamp,
		UpdatedAt:   timestamp,
	}

	if err := relationship.validate(); err != nil {
		return nil, err
	}

	return relationship, nil
}

func (r *Relationship) Updatestatus(status int8) error {
	r.UpdatedAt = time.Now().UTC().Unix()
	r.Status = status

	return r.validate()
}
