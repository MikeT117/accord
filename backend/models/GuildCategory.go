package models

import (
	"time"

	"github.com/google/uuid"
)

type GuildCategory struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
}
