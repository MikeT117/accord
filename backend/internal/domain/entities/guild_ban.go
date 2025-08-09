package entities

import (
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

type GuildBan struct {
	UserID    uuid.UUID
	GuildID   uuid.UUID
	Reason    string
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (u *GuildBan) validate() error {
	if u.UserID == uuid.Nil {
		return domain.NewDomainValidationError("user id must not be empty")
	}
	if u.GuildID == uuid.Nil {
		return domain.NewDomainValidationError("guild id must not be empty")
	}
	if strings.Trim(u.Reason, " ") == "" {
		return domain.NewDomainValidationError("reason must not be empty")
	}
	return nil
}

func NewGuildBan(guildID uuid.UUID, userID uuid.UUID, reason string) (*GuildBan, error) {
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
