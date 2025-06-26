package entities

import (
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
)

type GuildBan struct {
	UserID    string
	GuildID   string
	Reason    string
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (u *GuildBan) validate() error {
	if strings.Trim(u.UserID, " ") == "" {
		return domain.NewDomainValidationError("user id must not be empty")
	}
	if strings.Trim(u.GuildID, " ") == "" {
		return domain.NewDomainValidationError("guild id must not be empty")
	}
	if strings.Trim(u.Reason, " ") == "" {
		return domain.NewDomainValidationError("reason must not be empty")
	}
	return nil
}

func NewGuildBan(guildID string, userID string, reason string) (*GuildBan, error) {
	timestamp := time.Now().UTC()
	guildBan := &GuildBan{
		UserID:    userID,
		GuildID:   guildID,
		Reason:    reason,
		CreatedAt: timestamp,
		UpdatedAt: timestamp,
	}

	if err := guildBan.validate(); err != nil {
		return nil, err
	}

	return guildBan, nil
}

func (g *GuildBan) UpdateReason(reason string) error {
	g.Reason = reason
	g.UpdatedAt = time.Now().UTC()
	return g.validate()
}
