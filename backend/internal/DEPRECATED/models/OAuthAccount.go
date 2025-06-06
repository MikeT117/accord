package models

import (
	"time"

	"github.com/google/uuid"
)

type OAuthAccount struct {
	ID            uuid.UUID `json:"id"`
	Email         string    `json:"email"`
	Provider      string    `json:"provider"`
	ProviderToken string    `json:"providerToken"`
	ProviderID    string    `json:"providerId"`
	UpdatedAt     time.Time `json:"updatedAt"`
}
