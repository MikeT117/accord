package entities

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

type GuildInvite struct {
	ID        string
	UsedCount int64
	GuildID   string
	CreatedAt int64
	UpdatedAt int64
	ExpiresAt int64
}

func (u *GuildInvite) validate() error {
	if strings.Trim(u.ID, " ") == "" {
		return errors.New("user id must not be empty")
	}
	if u.UsedCount != 0 {
		return errors.New("used count must be zero")
	}
	if strings.Trim(u.GuildID, " ") == "" {
		return errors.New("guild id must not be empty")
	}
	return nil
}

func NewGuildInvite(guildID string, expiresAt int64) (*GuildInvite, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

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
	g.UpdatedAt = time.Now().UTC().Unix()

	return g.validate()
}
