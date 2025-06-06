package models

import (
	"github.com/google/uuid"
)

type GuildCategory struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}
