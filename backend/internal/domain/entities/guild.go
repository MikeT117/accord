package entities

import (
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

type Guild struct {
	ID              uuid.UUID
	CreatorID       uuid.UUID
	GuildCategoryID *uuid.UUID
	Name            string
	Description     string
	Discoverable    bool
	ChannelCount    int64
	MemberCount     int64
	CreatedAt       time.Time
	UpdatedAt       time.Time
	IconID          *uuid.UUID
	BannerID        *uuid.UUID
}

func (g *Guild) validate() error {
	if g.ID == uuid.Nil {
		return domain.NewDomainValidationError("empty id")
	}
	if g.CreatorID == uuid.Nil {
		return domain.NewDomainValidationError("empty creator id")
	}
	if strings.Trim(g.Name, " ") == "" {
		return domain.NewDomainValidationError("empty name")
	}
	if g.ChannelCount < 0 {
		return domain.NewDomainValidationError("negative channelCount")
	}
	if g.MemberCount < 1 {
		return domain.NewDomainValidationError("memberCount less than 1")
	}
	if g.IconID != nil && *g.IconID == uuid.Nil {
		return domain.NewDomainValidationError("empty icon id")
	}
	if g.BannerID != nil && *g.BannerID == uuid.Nil {
		return domain.NewDomainValidationError("empty banner id")
	}
	return nil
}

func NewGuild(creatorID uuid.UUID, name string, iconID *uuid.UUID) (*Guild, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
	guild := &Guild{
		ID:              ID,
		CreatorID:       creatorID,
		GuildCategoryID: nil,
		Name:            name,
		Description:     "",
		Discoverable:    false,
		ChannelCount:    0,
		MemberCount:     1,
		CreatedAt:       timestamp,
		UpdatedAt:       timestamp,
		IconID:          iconID,
		BannerID:        nil,
	}

	if err := guild.validate(); err != nil {
		return nil, err
	}

	return guild, nil
}

func (g *Guild) IsOwner(userID uuid.UUID) bool {
	return g.CreatorID == userID
}

func (g *Guild) UpdateGuildCategoryID(guildCategoryID *uuid.UUID) error {
	g.UpdatedAt = time.Now().UTC()
	g.GuildCategoryID = guildCategoryID
	return g.validate()
}

func (g *Guild) UpdateName(name string) error {
	g.UpdatedAt = time.Now().UTC()
	g.Name = name
	return g.validate()
}

func (g *Guild) UpdateDescription(description string) error {
	g.UpdatedAt = time.Now().UTC()
	g.Description = description
	return g.validate()
}

func (g *Guild) UpdateDiscoverable(discoverable bool) error {
	g.UpdatedAt = time.Now().UTC()
	g.Discoverable = discoverable
	return g.validate()
}

func (g *Guild) IncrementChannelCount() error {
	g.UpdatedAt = time.Now().UTC()
	g.ChannelCount = g.ChannelCount + 1
	return g.validate()
}

func (g *Guild) IncrementMemberCount() error {
	g.UpdatedAt = time.Now().UTC()
	g.MemberCount = g.MemberCount + 1
	return g.validate()
}

func (g *Guild) DecrementChannelCount() error {
	g.UpdatedAt = time.Now().UTC()
	g.ChannelCount = g.ChannelCount - 1
	return g.validate()
}

func (g *Guild) DecrementMemberCount() error {
	g.UpdatedAt = time.Now().UTC()
	g.MemberCount = g.MemberCount - 1
	return g.validate()
}

func (g *Guild) UpdateIconID(iconID *uuid.UUID) error {
	g.UpdatedAt = time.Now().UTC()
	g.IconID = iconID
	return g.validate()
}

func (g *Guild) UpdateBannerID(bannerID *uuid.UUID) error {
	g.UpdatedAt = time.Now().UTC()
	g.BannerID = bannerID
	return g.validate()
}
