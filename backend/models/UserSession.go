package models

import (
	"time"

	"github.com/google/uuid"
)

type UserSession struct {
	ID               uuid.UUID `json:"id"`
	IsCurrentSession bool      `json:"isCurrentSession"`
	Token            string    `json:"token"`
	UserID           uuid.UUID `json:"userId"`
	CreatedAt        time.Time `json:"createdAt"`
	ExpiresAt        time.Time `json:"expiresAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

type UserSessionLimited struct {
	ID               uuid.UUID `json:"id"`
	IsCurrentSession bool      `json:"isCurrentSession"`
	CreatedAt        time.Time `json:"createdAt"`
	ExpiresAt        time.Time `json:"expiresAt"`
}
