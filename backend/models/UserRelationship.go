package models

import (
	"time"

	"github.com/google/uuid"
)

type UserRelationship struct {
	ID        uuid.UUID   `json:"id"`
	CreatorID uuid.UUID   `json:"creatorId"`
	Status    int32       `json:"status"`
	CreatedAt time.Time   `json:"createdAt"`
	UpdatedAt time.Time   `json:"updatedAt"`
	User      UserLimited `json:"user"`
}
