package models

import (
	"time"

	"github.com/google/uuid"
)

type UserRelationship struct {
	ID        uuid.UUID   `json:"id"`
	CreatorID uuid.UUID   `json:"creatorId"`
	Status    int32       `json:"status"`
	UpdatedAt time.Time   `json:"updatedAt"`
	User      UserLimited `json:"user"`
}

type DeletedUserRelationship struct {
	ID uuid.UUID `json:"id"`
}

type UpdatedUserRelationship struct {
	ID     uuid.UUID `json:"id"`
	Status int32     `json:"status"`
}
