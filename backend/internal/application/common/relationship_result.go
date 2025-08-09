package common

import (
	"time"

	"github.com/google/uuid"
)

type RelationshipResult struct {
	ID          uuid.UUID
	CreatorID   uuid.UUID
	RecipientID uuid.UUID
	Status      int8
	CreatedAt   time.Time
	UpdatedAt   time.Time
	User        *UserResult
}
