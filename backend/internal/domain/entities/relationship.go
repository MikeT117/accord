package entities

import (
	"errors"
	"time"

	"github.com/google/uuid"
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
	if u.Status != 0 {
		return errors.New("status for new relationships must be '0'")
	}
	return nil
}

func NewRelationship(creatorID string, recipientID string) (*Relationship, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	return &Relationship{
		ID:          ID.String(),
		CreatorID:   creatorID,
		RecipientID: recipientID,
		Status:      0,
		CreatedAt:   timestamp,
		UpdatedAt:   timestamp,
	}, nil
}
