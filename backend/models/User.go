package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                uuid.UUID  `json:"id"`
	Avatar            *uuid.UUID `json:"avatar"`
	DisplayName       string     `json:"displayName"`
	Username          string     `json:"username"`
	PublicFlags       int32      `json:"publicFlags"`
	RelationshipCount int32      `json:"relationshipCount"`
	OauthAccountID    uuid.UUID  `json:"oauthAccountId"`
	CreatedAt         time.Time  `json:"createdAt"`
	UpdatedAt         time.Time  `json:"updatedAt"`
}

type UserLimited struct {
	ID          uuid.UUID  `json:"id"`
	Avatar      *uuid.UUID `json:"avatar"`
	DisplayName string     `json:"displayName"`
	Username    string     `json:"username"`
	PublicFlags int32      `json:"publicFlags"`
}
