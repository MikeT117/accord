package common

import "time"

type RelationshipResult struct {
	ID          string
	CreatorID   string
	RecipientID string
	Status      int8
	CreatedAt   time.Time
	UpdatedAt   time.Time
	User        *UserResult
}
