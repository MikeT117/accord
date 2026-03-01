package entities

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

type GuildInvite struct {
	ID        uuid.UUID
	UsedCount int64
	GuildID   uuid.UUID
	CreatorID uuid.UUID
	CreatedAt time.Time
	UpdatedAt time.Time
	ExpiresAt time.Time
}

func (u *GuildInvite) validate() error {
	if u.ID == uuid.Nil {
		return domain.NewDomainValidationError("user id must not be empty")
	}
	if u.UsedCount != 0 {
		return domain.NewDomainValidationError("used count must be zero")
	}
	if u.CreatorID == uuid.Nil {
		return domain.NewDomainValidationError("creator id must not be empty")
	}
	if u.GuildID == uuid.Nil {
		return domain.NewDomainValidationError("guild id must not be empty")
	}
	return nil
}

func NewGuildInvite(guildID uuid.UUID, expiresAt time.Time, creatorID uuid.UUID) (*GuildInvite, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
	guildInvite := &GuildInvite{
		ID:        ID,
		UsedCount: 0,
		CreatorID: creatorID,
		GuildID:   guildID,
		CreatedAt: timestamp,
		UpdatedAt: timestamp,
		ExpiresAt: expiresAt,
	}

	if err := guildInvite.validate(); err != nil {
		return nil, err
	}

	return guildInvite, nil
}

func (g *GuildInvite) IncrementusedCount() error {
	g.UsedCount = g.UsedCount + 1
	g.UpdatedAt = time.Now().UTC()
	return g.validate()
}
