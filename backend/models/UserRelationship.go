package models

import (
	"time"

	"github.com/google/uuid"
)

type UserRelationship struct {
	ID        uuid.UUID     `json:"id"`
	Status    int           `json:"status"`
	Members   []UserLimited `json:"members"`
	CreatedAt time.Time     `json:"createdAt"`
	UpdatedAt time.Time     `json:"updatedAt"`
}
