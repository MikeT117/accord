package entities

import (
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

type GuildInvite struct {
	ID        string
	UsedCount int64
	GuildID   string
	CreatedAt time.Time
	UpdatedAt time.Time
	ExpiresAt time.Time
}

func (u *GuildInvite) validate() error {
	if strings.Trim(u.ID, " ") == "" {
		return domain.NewDomainValidationError("user id must not be empty")
	}
	if u.UsedCount != 0 {
		return domain.NewDomainValidationError("used count must be zero")
	}
	if strings.Trim(u.GuildID, " ") == "" {
		return domain.NewDomainValidationError("guild id must not be empty")
	}
	return nil
}

func NewGuildInvite(guildID string, expiresAt time.Time) (*GuildInvite, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
	guildInvite := &GuildInvite{
		ID:        ID.String(),
		UsedCount: 0,
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
