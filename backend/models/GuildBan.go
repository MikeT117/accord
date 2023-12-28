package models

import "github.com/google/uuid"

type GuildBan struct {
	ID     uuid.UUID   `json:"id"`
	Reason string      `json:"reason"`
	User   UserLimited `json:"user"`
}
