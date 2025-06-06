package entities

import (
	"errors"
	"strings"
	"time"
)

type GuildBan struct {
	UserID    string
	GuildID   string
	Reason    string
	CreatedAt int64
	UpdatedAt int64
}

func (u *GuildBan) validate() error {
	if strings.Trim(u.UserID, " ") == "" {
		return errors.New("user id must not be empty")
	}
	if strings.Trim(u.GuildID, " ") == "" {
		return errors.New("guild id must not be empty")
	}
	if strings.Trim(u.Reason, " ") == "" {
		return errors.New("reason must not be empty")
	}
	return nil
}

func NewGuildBan(guildID string, userID string, reason string) (*GuildBan, error) {
	timestamp := time.Now().UTC().Unix()

	return &GuildBan{
		UserID:    userID,
		GuildID:   guildID,
		Reason:    reason,
		CreatedAt: timestamp,
		UpdatedAt: timestamp,
	}, nil
}
